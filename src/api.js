import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/birthdays';

// ✅ Fetch all birthdays
export const fetchBirthdays = async () => {
  const res = await axios.get(API_BASE_URL);
  return res.data;
};

// ✅ Add a new birthday
export const addBirthday = async (birthday) => {
  const res = await axios.post(API_BASE_URL, birthday);
  return res.data;
};

// ✅ Delete a birthday
export const deleteBirthday = async (id) => {
  const res = await axios.delete(`${API_BASE_URL}/${id}`);
  return res.data;
};
