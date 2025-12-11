import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountForm } from '@/components/AccountForm';

describe('AccountForm', () => {
  it('validates required fields and submits', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(<AccountForm onSubmit={onSubmit} />);

    const submit = screen.getByRole('button', { name: /create account/i });
    await userEvent.click(submit);

    expect(await screen.findByText(/name must be at least/i)).toBeInTheDocument();

    const nameInput = screen.getByLabelText(/display name/i);
    const emailInput = screen.getByLabelText(/contact email/i);

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Collector Hub');
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'contact@example.com');

    fireEvent.click(screen.getByLabelText(/shop/i));

    await userEvent.click(submit);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Collector Hub', email: 'contact@example.com', type: 'shop' });
  });
});
