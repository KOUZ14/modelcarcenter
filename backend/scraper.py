import time
from fuzzywuzzy import fuzz
from playwright.async_api import async_playwright
import asyncio

def is_relevant(title: str, query: str, threshold: int = 90) -> bool:
    score = fuzz.partial_ratio(query.lower(), title.lower())
    return score >= threshold

async def scrape_stmdiecast_page(page, query, page_num):
    base_url = "https://www.stmdiecast.com/search"
    url = f"{base_url}?&options%5Bprefix%5D=last&page={page_num}&q={query}"
    print(f"Scraping STMDiecast page {page_num}: {url}")

    try:
        await page.goto(url, timeout=30000)
        await page.wait_for_load_state("load", timeout=10000)
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(2)
    except Exception as e:
        print(f"[STMDiecast] Timeout or error on page {page_num}: {e}")
        return []

    products = await page.query_selector_all('li.grid__item')
    results = []

    for product in products:
        title_tag = await product.query_selector('h3.card__heading a')
        price_tag = await product.query_selector('.price-item--last')
        img_tag = await product.query_selector('img')

        if title_tag:
            title = (await title_tag.inner_text()).strip()
            link = "https://www.stmdiecast.com" + (await title_tag.get_attribute('href'))
            price = (await price_tag.inner_text()).strip() if price_tag else "Price not found"
            image = await img_tag.get_attribute('src') if img_tag else None

            results.append({
                "title": title,
                "price": price,
                "link": link,
                "image": image,
                "source": "STMDiecast"
            })

    return results

async def scrape_stmdiecast(query):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        results = []
        page_num = 1

        while True:
            context = await browser.new_context()
            page = await context.new_page()
            page_results = await scrape_stmdiecast_page(page, query, page_num)
            await context.close()

            if not page_results:
                break

            results.extend(page_results)
            page_num += 1

        await browser.close()
        return results

async def scrape_livecarmodel_page(page, url):
    print(f"Scraping: {url}")
    try:
        await page.goto(url, timeout=30000)
        await page.wait_for_load_state("load", timeout=10000)
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(2)
    except Exception as e:
        print(f"[LiveCarModel] Timeout or error on page: {e}")
        return []

    products = await page.query_selector_all('li.product')
    results = []

    for product in products:
        title_tag = await product.query_selector('h4.card-title')
        link_tag = await product.query_selector('a.image-link.desktop')
        price_tag = await product.query_selector('[data-product-price-without-tax]')
        img_tag = await product.query_selector('img.card-image')

        if title_tag and link_tag:
            title = (await title_tag.inner_text()).strip()
            link = await link_tag.get_attribute('href')
            price = (await price_tag.inner_text()).strip() if price_tag else "Price not found"
            image = await img_tag.get_attribute('data-src') or await img_tag.get_attribute('src') if img_tag else None

            results.append({
                "title": title,
                "price": price,
                "link": link,
                "image": image,
                "source": "LiveCarModel"
            })

    return results

async def scrape_livecarmodel(query):
    base = "https://livecarmodel.com"
    search_url = f"{base}/search.php?search_query={query}&section=product"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        main_page = await context.new_page()

        try:
            await main_page.goto(search_url, timeout=30000)
            await main_page.wait_for_load_state("load", timeout=10000)
        except Exception as e:
            print(f"[LiveCarModel] Failed to load main search page: {e}")
            await browser.close()
            return []

        pagination_urls = {search_url}
        page_links = await main_page.query_selector_all('a.pagination-link')
        for link in page_links:
            href = await link.get_attribute("href")
            if href and "/search.php" in href:
                pagination_urls.add(base + href)

        await context.close()

        tasks = []
        for url in pagination_urls:
            async def scrape_with_new_page(url=url):
                ctx = await browser.new_context()
                pg = await ctx.new_page()
                result = await scrape_livecarmodel_page(pg, url)
                await ctx.close()
                return result

            tasks.append(asyncio.create_task(scrape_with_new_page()))

        results = await asyncio.gather(*tasks)
        await browser.close()
        return [item for sublist in results for item in sublist]
