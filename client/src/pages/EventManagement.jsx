import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import useEventManagementState from '../hooks/useEventManagementState';
import EventFilters from '../components/EventManagement/EventFilters';
import EventTable from '../components/EventManagement/EventTable';

const EventManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const state = useEventManagementState(searchTerm);

  return (
    <AdminLayout searchTerm={searchTerm} onSearchChange={setSearchTerm}>
      <section className="space-y-6">
        <EventFilters {...state} />
        <EventTable
          events={state.filteredEvents}
          loading={state.loading}
          error={state.error}
          handleDelete={state.handleDelete}
        />
      </section>
    </AdminLayout>
  );
};

export default EventManagementPage;
