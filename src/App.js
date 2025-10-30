import React, { useState, useEffect } from 'react';
import { Gift, Plus, Trash2, Calendar, Mail } from 'lucide-react';
import { fetchBirthdays, addBirthday, deleteBirthday } from './api.js';

export default function BirthdayApp() {
  const [birthdays, setBirthdays] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    interests: '',
    email: ''
  });

  useEffect(() => {
    loadBirthdays();
  }, []);

  const loadBirthdays = async () => {
    try {
      const data = await fetchBirthdays();
      setBirthdays(data);
    } catch (err) {
      console.error('Error loading birthdays:', err);
    }
  };

  const handleAddBirthday = async () => {
    if (!formData.name || !formData.date) return;

    const newBirthday = {
      name: formData.name,
      date: formData.date,
      email: formData.email,
      interests: formData.interests.split(',').map(i => i.trim()).filter(i => i)
    };

    try {
      const saved = await addBirthday(newBirthday);
      setBirthdays([...birthdays, saved]);
      setFormData({ name: '', date: '', interests: '', email: '' });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding birthday:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBirthday(id);
      setBirthdays(birthdays.filter(b => b._id !== id));
    } catch (err) {
      console.error('Error deleting birthday:', err);
    }
  };

  const getDaysUntil = (dateString) => {
    const today = new Date();
    const birthday = new Date(dateString);
    const currentYear = today.getFullYear();
    birthday.setFullYear(currentYear);

    if (birthday < today) birthday.setFullYear(currentYear + 1);
    const diff = birthday - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const sortedBirthdays = [...birthdays].sort(
    (a, b) => getDaysUntil(a.date) - getDaysUntil(b.date)
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ backgroundColor: '#3b82f6', padding: '8px', borderRadius: '8px' }}>
                <Gift color="white" size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                  Birthday Reminder
                </h1>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  Never miss a special day again 🎈
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <Plus size={20} /> Add Birthday
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1152px', margin: '0 auto', padding: '32px 16px' }}>
        {showAddForm && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              padding: '24px',
              marginBottom: '24px'
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
              Add New Birthday
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <input type="text" placeholder="Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                <input type="email" placeholder="Email (optional)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input type="text" placeholder="Interests (comma-separated)" value={formData.interests} onChange={e => setFormData({...formData, interests: e.target.value})} />
              </div>
              <button onClick={handleAddBirthday} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '10px', border: 'none', borderRadius: '8px' }}>
                Save
              </button>
            </div>
          </div>
        )}

        {/* Cards for each birthday */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {sortedBirthdays.map(b => {
            const daysLeft = getDaysUntil(b.date);
            const isToday = daysLeft === 0;
            const age = new Date().getFullYear() - new Date(b.date).getFullYear();
            const giftIdea = b.giftSuggestions || "🎁 Generating AI gift ideas...";

            return (
              <div
                key={b._id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  borderLeft: isToday ? '5px solid #22c55e' : '5px solid #3b82f6'
                }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>{b.name}</h3>
                <p style={{ color: '#6b7280' }}>
                  <Calendar size={14} style={{ marginRight: '6px' }} />
                  {new Date(b.date).toLocaleDateString()} ({age} yrs)
                </p>
                <p style={{ margin: '8px 0', color: '#2563eb' }}>
                  {isToday ? '🎉 Today!' : `${daysLeft} days left`}
                </p>
                <p style={{ color: '#111827' }}>{giftIdea}</p>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <button onClick={() => handleDelete(b._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                  {isToday && b.email && (
                    <button
                      style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer' }}
                      onClick={() => sendBirthdayEmail(b.email, b.name)}
                    >
                      <Mail size={18} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );

  async function sendBirthdayEmail(email, name) {
    try {
      await fetch('http://localhost:3001/api/birthdays/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      alert(`🎉 Sent Happy Birthday email to ${name}!`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
