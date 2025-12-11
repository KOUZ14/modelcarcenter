import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentDialog } from '@/components/PaymentDialog';

describe('PaymentDialog', () => {
  it('validates metadata JSON before submitting', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <PaymentDialog
        open
        onOpenChange={jest.fn()}
        onSubmit={onSubmit}
        isSubmitting={false}
        accounts={[]}
        latestPayment={null}
      />
    );

    const metadataField = await screen.findByLabelText(/metadata json/i);
    await userEvent.type(metadataField, 'not-json');

    const submit = screen.getByRole('button', { name: /create payment intent/i });
    await userEvent.click(submit);

    expect(await screen.findByText(/metadata must be valid json/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
