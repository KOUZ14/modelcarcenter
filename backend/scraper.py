from playwright.sync_api import sync_playwright
import time
from fuzzywuzzy import fuzz

def is_relevant(title: str, query: str, threshold: int = 90) -> bool:
    """
    Return True if title matches query based on partial fuzzy ratio.
    """
    score = fuzz.partial_ratio(query.lower(), title.lower())
    return score >= threshold

def scrape_stmdiecast(query):
    base_url = "https://www.stmdiecast.com/search"
    results = []
    page_num = 1

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        while True:
            url = f"{base_url}?&options%5Bprefix%5D=last&page={page_num}&q={query}"
            print(f"Scraping STMDiecast page {page_num}: {url}")
            time.sleep(2)
            page.goto(url)

            products = page.query_selector_all('li.grid__item')

            # If no products found on this page, stop
            if not products:
                print(f"No more products found on page {page_num}. Stopping.")
                break

            for product in products:
                title_tag = product.query_selector('h3.card__heading a')
                price_tag = product.query_selector('.price-item--last')
                img_tag = product.query_selector('img')

                if title_tag:
                    title = title_tag.inner_text().strip()
                    link = "https://www.stmdiecast.com" + title_tag.get_attribute('href')
                    price = price_tag.inner_text().strip() if price_tag else "Price not found"
                    image = img_tag.get_attribute('src') if img_tag else None

                    if is_relevant(title, query):
                        results.append({
                            "title": title,
                            "price": price,
                            "link": link,
                            "image": image,
                            "source": "STMDiecast"
                        })

            page_num += 1

        browser.close()

    return results

def scrape_livecarmodel(query):
    base = "https://livecarmodel.com"
    search_url = f"{base}/search.php?search_query={query}&section=product"
    visited_urls = set()
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(search_url)
        time.sleep(3)

        # Collect initial and all pagination URLs
        pagination_urls = set()
        pagination_urls.add(search_url)

        page_links = page.query_selector_all('a.pagination-link')
        for link in page_links:
            href = link.get_attribute("href")
            if href and "/search.php" in href:
                full_url = base + href
                pagination_urls.add(full_url)

        # Visit each page and scrape
        for url in sorted(pagination_urls):
            if url in visited_urls:
                continue

            print(f"Scraping: {url}")
            page.goto(url)
            page.wait_for_load_state("networkidle")
            time.sleep(2)
            visited_urls.add(url)

            products = page.query_selector_all('li.product')

            for product in products:
                title_tag = product.query_selector('h4.card-title')
                link_tag = product.query_selector('a.image-link.desktop')
                price_tag = product.query_selector('[data-product-price-without-tax]')
                img_tag = product.query_selector('img.card-image')

                if title_tag and link_tag:
                    title = title_tag.inner_text().strip()
                    link = link_tag.get_attribute('href')
                    price = price_tag.inner_text().strip() if price_tag else "Price not found"
                    image = img_tag.get_attribute('src') if img_tag else None

                    if is_relevant(title, query):
                        results.append({
                            "title": title,
                            "price": price,
                            "link": link,
                            "image": image,
                            "source": "LiveCarModel"
                        })

        browser.close()
        print(f"Scraped {len(results)} products")

    return results
