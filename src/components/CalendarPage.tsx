import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer, type Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Training } from '../types';
import { trainingService, customerService } from '../services/api';
import { extractIdFromUrl } from '../types';
import './CalendarPage.css';

const localizer = momentLocalizer(moment);

const CalendarPage: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [trainingsResponse] = await Promise.all([
        trainingService.getAll(),
        customerService.getAll()
      ]);

      const trainingsData = trainingsResponse.data._embedded.trainings;

      // Enriquecer entrenamientos con nombres de clientes
      const enrichedTrainings = await Promise.all(
        trainingsData.map(async (training: any) => {
          let customerName = "Unknown Customer";
          let trainingId = training.id;

          if (!trainingId && training._links?.self?.href) {
            trainingId = extractIdFromUrl(training._links.self.href);
          }

          if (training._links?.customer?.href) {
            const href = training._links.customer.href;
            try {
              const response = await fetch(href);
              if (response.ok) {
                const customer = await response.json();
                customerName = `${customer.firstname} ${customer.lastname}`;
              }
            } catch (error) {
              console.error("Error fetching customer data:", error);
            }
          }

          return {
            ...training,
            id: trainingId,
            customerName,
          };
        })
      );

      setTrainings(enrichedTrainings);

      // Convertir entrenamientos a eventos para el calendario
      const calendarEvents = enrichedTrainings.map(training => ({
        id: training.id,
        title: `${training.activity} - ${training.customerName} (${training.duration}min)`,
        start: new Date(training.date),
        end: new Date(new Date(training.date).getTime() + training.duration * 60000),
        allDay: false,
        resource: training
      }));

      setEvents(calendarEvents);
    } catch (error: any) {
      console.error("Error loading calendar data:", error);
      const errorMessage = error.response?.data?.message || 'Error loading calendar data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: Event) => {
    alert(`Training Details:\n
      Activity: ${event.resource.activity}\n
      Customer: ${event.resource.customerName}\n
      Date: ${moment(event.start).format('DD.MM.YYYY HH:mm')}\n
      Duration: ${event.resource.duration} minutes`);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Aquí podrías añadir funcionalidad para crear nuevos entrenamientos
    // desde el calendario si lo deseas
    console.log('Selected slot:', start, end);
  };

  if (loading) {
    return <div className="loading">Loading calendar...</div>;
  }

  if (error) {
    return (
      <div className="calendar-page">
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <h2>Training Calendar</h2>
      
      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          popup
          eventPropGetter={() => ({
            style: {
              backgroundColor: '#3174ad',
              borderRadius: '5px',
              opacity: 0.8,
              color: 'white',
              border: '0px',
              display: 'block'
            }
          })}
        />
      </div>

      <div className="calendar-info">
        <p>Total trainings: {trainings.length}</p>
        <p>Click on any training to see details</p>
      </div>
    </div>
  );
};

export default CalendarPage;