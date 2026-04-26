import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RemoveEmployeeForm from './RemoveEmployee';

describe('RemoveEmployeeForm', () => {
  test('Cancel button closes the modal', async () => {
    const onClose = jest.fn();
    const onRemove = jest.fn();
    const user = userEvent.setup();

    render(
      <RemoveEmployeeForm visible={true} onClose={onClose} onRemove={onRemove} employee={[]} />
    );

    const cancel = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancel);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('Submitting with no selection shows an error message', async () => {
    const onClose = jest.fn();
    const onRemove = jest.fn();
    const user = userEvent.setup();

    render(
      <RemoveEmployeeForm visible={true} onClose={onClose} onRemove={onRemove} employee={[]} />
    );

    const remove = screen.getByRole('button', { name: /^remove$/i });
    await user.click(remove);

    expect(await screen.findByText(/Please select an employee to remove/i)).toBeInTheDocument();
    expect(onRemove).not.toHaveBeenCalled();
  });

  test('Selecting an employee and clicking Remove shows confirmation; canceling confirmation returns to form', async () => {
    const onClose = jest.fn();
    const onRemove = jest.fn();
    const employees = [{ employee_id: 5, first_name: 'Alice', last_name: 'Smith' }];
    const user = userEvent.setup();

    render(
      <RemoveEmployeeForm visible={true} onClose={onClose} onRemove={onRemove} employee={employees} />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, String(5));

    const remove = screen.getByRole('button', { name: /^remove$/i });
    await user.click(remove);

    expect(await screen.findByText(/Are you sure you want to remove/i)).toBeInTheDocument();
    expect(screen.getByText(/Alice/)).toBeInTheDocument();

    const confirmCancel = screen.getByRole('button', { name: /^cancel$/i });
    await user.click(confirmCancel);

    // After canceling confirmation, the Remove button (form) should be visible again
    expect(await screen.findByRole('button', { name: /^remove$/i })).toBeInTheDocument();
  });

  test('Confirm Remove calls onRemove and then closes the modal', async () => {
    const onClose = jest.fn();
    const onRemove = jest.fn().mockResolvedValue(undefined);
    const employees = [{ employee_id: 7, name: 'Bob' }];
    const user = userEvent.setup();

    render(
      <RemoveEmployeeForm visible={true} onClose={onClose} onRemove={onRemove} employee={employees} />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, String(7));

    const remove = screen.getByRole('button', { name: /^remove$/i });
    await user.click(remove);

    const confirm = await screen.findByRole('button', { name: /confirm remove/i });
    await user.click(confirm);

    await waitFor(() => expect(onRemove).toHaveBeenCalledWith(7));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('When onRemove throws, an error is shown and confirming is reset', async () => {
    const onClose = jest.fn();
    const onRemove = jest.fn().mockRejectedValue(new Error('boom'));
    const employees = [{ id: 9, name: 'Charlie' }];
    const user = userEvent.setup();

    render(
      <RemoveEmployeeForm visible={true} onClose={onClose} onRemove={onRemove} employee={employees} />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, String(9));

    const remove = screen.getByRole('button', { name: /^remove$/i });
    await user.click(remove);

    const confirm = await screen.findByRole('button', { name: /confirm remove/i });
    await user.click(confirm);

    expect(await screen.findByText(/boom/i)).toBeInTheDocument();
    // After the failure, the form should be visible again (confirming false)
    expect(screen.getByRole('button', { name: /^remove$/i })).toBeInTheDocument();
  });
});
