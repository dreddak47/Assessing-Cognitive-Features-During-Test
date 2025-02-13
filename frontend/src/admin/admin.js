import React, { useState, useEffect } from "react";
import axios from "axios";
import './admin.css';

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [users, setUsers] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchUsers();
    }
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (username === "admin" && pin === "1234") {
      setIsLoggedIn(true);
    } else {
      alert("Invalid credentials");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_BASEURL}/get_users`
      );
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDownloadclick = async (name) => {
    try {
        name=name.split(" ")[0].toLowerCase();
        const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_BASEURL}/download-file-click`
            , { name });
        const data = response.data;
        console.log(data);
        if (data.url) {
            setDownloadUrl(data.url);
            window.open(data.url, "_blank"); // Opens the file in a new tab
        } else {
            alert("File not found.");
        }
    } catch (error) {
        console.error("Error downloading file:", error);
    }
};

const handleDownloadcamera = async (name) => {
  try {
      name=name.split(" ")[0].toLowerCase();
      const response = await axios.post(
          `${process.env.REACT_APP_BACKEND_BASEURL}/download-file-camera`
          , { name });
      const data = response.data;
      console.log(data);
      if (data.url) {
          setDownloadUrl(data.url);
          window.open(data.url, "_blank"); // Opens the file in a new tab
      } else {
          alert("File not found.");
      }
  } catch (error) {
      console.error("Error downloading file:", error);
  }
};


  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="admin-container">
  <h2>Admin Panel</h2>
  <div className="admin-panel">
    <table className="admin-table">
      <thead>
        <tr>
          <th>Ref ID</th>
          <th>Email</th>
          <th>Institution</th>
          <th>Name</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user, index) => (
          <tr key={index}>
            <td>
              batch: {user.edata.batch} <br />
              branch: {user.edata.branch} <br />
              rollNo: {user.edata.rollNo} <br />
              refID: {user.edata.refID} <br />
            </td>
            <td>{user.email}</td>
            <td>{user.institution}</td>
            <td>{user.name}</td>
            <td>
              <button className="admin-download-btn" onClick={() => handleDownloadclick(user.name)}>Download click Logs</button>
              <button className="admin-view-btn" onClick={() => handleDownloadcamera(user.name)}>Download Camera Logs</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
  );
};

export default AdminPage;
