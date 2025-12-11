import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingEditorModal } from '@/components/ListingEditorModal';
import type { Listing } from '@/types';

describe('ListingEditorModal', () => {
  const baseListing: Listing = {
    id: 'listing-1',
    title: 'Ferrari 458',
    price: 199.99,
    currency: 'USD',
    status: 'published',
    quantity: 3,
    description: '1:18 scale',
  };

  it('loads initial values and saves updates', async () => {
    const onSave = jest.fn();

    render(
      <ListingEditorModal
        open
        initialListing={baseListing}
        onClose={jest.fn()}
        onSave={onSave}
        isSaving={false}
      />
    );

    const titleInput = await screen.findByLabelText(/title/i);
    expect(titleInput).toHaveValue(baseListing.title);

    const priceInput = screen.getByLabelText(/price/i);
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '250');

    const saveButton = screen.getByRole('button', { name: /save listing/i });
    await userEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: baseListing.title,
        price: 250,
        currency: baseListing.currency,
      })
    );
  });
});
