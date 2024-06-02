import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import './index.css';

function App() {
  const [activeComponent, setActiveComponent] = useState('home');

  const showHome = () => setActiveComponent('home');
  const showToolLibrary = () => setActiveComponent('toolLibrary');

  return (
    <div className="container">
      {activeComponent === 'home' && (
        <Home onToolLibraryClick={showToolLibrary} />
      )}
      {activeComponent === 'toolLibrary' && (
        <ToolLibrary onBackClick={showHome} />
      )}
    </div>
  );
}

function Home({ onToolLibraryClick }) {
  const titleRef = useRef(null);
  const buttonContainerRef = useRef(null);

  useEffect(() => {
    if (titleRef.current && buttonContainerRef.current) {
      const titleHeight = titleRef.current.clientHeight;
      buttonContainerRef.current.style.marginTop = `${titleHeight}px`;
    }
  }, []);

  return (
    <>
      <h1 className="title" ref={titleRef}>智慧刀具管理平台</h1>
      <div className="button-container home-button-container" ref={buttonContainerRef}>
        <button className="button" onClick={onToolLibraryClick}>刀具庫</button>
        <button className="button">開始工作</button>
        <button className="button">工作紀錄</button>
      </div>
    </>
  );
}

function ToolLibrary({ onBackClick }) {
  const [tools, setTools] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    distance: '',
    health: ''
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tools');
        setTools(response.data);
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };
    fetchTools();
  }, []);

  const handleShowForm = () => {
    setShowForm(true);
  };

  const handleHideForm = () => {
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/tools', formData);
      setTools([...tools, response.data]);
      handleHideForm();
    } catch (error) {
      console.error('Error creating tool:', error);
    }
  };

  const titleRef = useRef(null);
  const buttonContainerRef = useRef(null);

  useEffect(() => {
    if (titleRef.current && buttonContainerRef.current) {
      const titleHeight = titleRef.current.clientHeight;
      titleRef.current.style.marginTop = `${titleHeight / 2}px`;
      buttonContainerRef.current.style.marginTop = `${titleHeight}px`;
    }
  }, []);

  return (
    <>
      <button className="back-button" onClick={onBackClick}>返回</button>
      <h1 className="title" ref={titleRef}>刀具庫</h1>
      <div className="tool-library-button-container" ref={buttonContainerRef}>
        <button className="small-button" onClick={handleShowForm}>新增</button>
        <button className="small-button">移除</button>
        <button className="small-button">編輯</button>
      </div>
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                名稱:
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </label>
              <label>
                已使用距離:
                <input
                  type="text"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                />
              </label>
              <label>
                健康度:
                <input
                  type="text"
                  name="health"
                  value={formData.health}
                  onChange={handleChange}
                />
              </label>
            </div>
            <div className="form-buttons">
              <button className="small-button" type="submit">提交</button>
              <button className="small-button" type="button" onClick={handleHideForm}>取消</button>
            </div>
          </form>
        </div>
      )}
      <div className="table-container">
        <table className="tool-table">
          <thead>
            <tr>
              <th></th>
              <th>名稱</th>
              <th>已使用距離</th>
              <th>健康度</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool._id}>
                <td><input type="checkbox" /></td>
                <td>{tool.name}</td>
                <td>{tool.distance}</td>
                <td>{tool.health}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
