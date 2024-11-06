import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './register.css';

const Register = () => {
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [branch, setBranch] = useState('');
const navigate = useNavigate();

const handleSubmit = (e) => {
  console.log("registering");
  e.preventDefault();
  axios.post(`${import.meta.env.BACKEND_BASEURL}/register`, { name, email, branch })
    .then(response => {
      console.log(response.data);
      navigate('/test',{ state: { info: name } });
    })
    .catch(error => console.error('There was an error!', error));
};

  return (
    <div>
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="text" placeholder="Branch" value={branch} onChange={e => setBranch(e.target.value)} required />
      <button type="submit">Register</button>
    </form>

    <div className="rules-header">
      <h2>Test Rules</h2>
      <ul>
        <li>Each question is allotted 30 seconds.</li>
        <li>Once submitted, the answers can be viewed but not edited.</li>
        <li>No cheating is allowed. Any suspicious activity will be flagged.</li>
        <li>Make sure to read each question carefully before answering.</li>
        <li>Keep track of your time and manage it wisely throughout the test.</li>
      </ul>
    </div>
    
    </div>
  );
};

export default Register;