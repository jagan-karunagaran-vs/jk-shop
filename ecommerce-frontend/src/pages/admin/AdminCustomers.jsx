import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminCustomers } from '../../redux/thunks/adminThunks';

const AdminCustomers = () => {
  const dispatch = useDispatch();
  const { customers, customersTotal, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminCustomers());
  }, [dispatch]);

  return (
    <div className="admin-customers-page">
      <h2>Customers ({customersTotal})</h2>

      {loading && <p className="loading-text">Loading customers...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>
                    <span className={customer.isActive ? 'badge-active' : 'badge-inactive'}>
                      {customer.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td>{new Date(customer.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;