import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactDOM from 'react-dom';
import './index.css';

function App() {
  const [activeComponent, setActiveComponent] = useState('home');

  const showHome = () => setActiveComponent('home');
  const showToolLibrary = () => setActiveComponent('toolLibrary');
  const showSmartCutting = () => setActiveComponent('smartCutting');
  const showWorkRecords = () => setActiveComponent('workRecords');

  return (
    <div className="container">
      {activeComponent === 'home' && (
        <Home 
          onToolLibraryClick={showToolLibrary} 
          onSmartCuttingClick={showSmartCutting} 
          onWorkRecordsClick={showWorkRecords} 
        />
      )}
      {activeComponent === 'toolLibrary' && (
        <ToolLibrary onBackClick={showHome} />
      )}
      {activeComponent === 'smartCutting' && (
        <SmartCutting onBackClick={showHome} onSuccess={showHome} />
      )}
      {activeComponent === 'workRecords' && (
        <WorkRecords onBackClick={showHome} />
      )}
    </div>
  );
}

function Home({ onToolLibraryClick, onSmartCuttingClick, onWorkRecordsClick }) {
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
      <div className="dashboard-buttons" ref={buttonContainerRef}></div>
      <div className="button-container home-button-container">
        <button className="button" onClick={onToolLibraryClick}>刀具庫</button>
        <button className="button" onClick={onSmartCuttingClick}>開始工作</button>
        <button className="button" onClick={onWorkRecordsClick}>工作紀錄</button>
      </div>
    </>
  );
}

function ToolLibrary({ onBackClick }) {
  const [tools, setTools] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    maxDistance: '',
    remainingDistance: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedToolId, setSelectedToolId] = useState('');

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

  const handleShowForm = (tool = {}) => {
    setFormData({
      id: tool._id || '',
      name: tool.name || '',
      maxDistance: tool.maxDistance || '',
      remainingDistance: tool.remainingDistance || ''
    });
    setIsEditing(!!tool._id);
    setShowForm(true);
  };

  const handleHideForm = () => {
    setShowForm(false);
    setFormData({
      id: '',
      name: '',
      maxDistance: '',
      remainingDistance: ''
    });
    setIsEditing(false);
    setSelectedToolId('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, name, maxDistance, remainingDistance } = formData;
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/tools/${id}`, {
          name,
          maxDistance: parseFloat(maxDistance),
          remainingDistance: parseFloat(remainingDistance)
        });
      } else {
        await axios.post('http://localhost:5000/api/tools', {
          name,
          maxDistance: parseFloat(maxDistance),
          remainingDistance: parseFloat(remainingDistance)
        });
      }
      const response = await axios.get('http://localhost:5000/api/tools');
      setTools(response.data);
      handleHideForm();
    } catch (error) {
      console.error('Error saving tool:', error);
    }
  };

  const handleEdit = () => {
    const selectedTool = tools.find(tool => tool._id === selectedToolId);
    handleShowForm(selectedTool);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/tools/${selectedToolId}`);
      const response = await axios.get('http://localhost:5000/api/tools');
      setTools(response.data);
      handleHideForm();
    } catch (error) {
      console.error('Error deleting tool:', error);
    }
  };

  return (
    <>
      <h2 className="tool-library-title">刀具庫</h2>
      <div className="tool-library-button-container">
        <button className="small-button" onClick={onBackClick}>返回</button>
        <button className="small-button" onClick={() => handleShowForm()}>新增刀具</button>
        <button className="small-button" onClick={handleEdit} disabled={!selectedToolId}>編輯</button>
        <button className="small-button" onClick={handleDelete} disabled={!selectedToolId}>移除</button>
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
                  required
                />
              </label>
              <label>
                最大使用距離:
                <input
                  type="number"
                  step="0.01"
                  name="maxDistance"
                  value={formData.maxDistance}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                剩餘使用距離:
                <input
                  type="number"
                  step="0.01"
                  name="remainingDistance"
                  value={formData.remainingDistance}
                  onChange={handleChange}
                  required
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
              <th>勾選</th>
              <th>名稱</th>
              <th>最大使用距離</th>
              <th>剩餘使用距離</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool._id}>
                <td>
                  <input
                    type="radio"
                    className="custom-checkbox"
                    checked={selectedToolId === tool._id}
                    onChange={() => setSelectedToolId(tool._id)}
                  />
                </td>
                <td>{tool.name}</td>
                <td>{tool.maxDistance.toFixed(2)}</td>
                <td>{tool.remainingDistance.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SmartCutting({ onBackClick, onSuccess }) {
  const [length, setLength] = useState('');
  const [widths, setWidths] = useState(['']);
  const [recommendedTools, setRecommendedTools] = useState([]);
  const [allTools, setAllTools] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tools');
        setAllTools(response.data);
      } catch (error) {
        console.error('Error fetching tools:', error);
      }
    };
    fetchTools();
  }, []);

  const handleAddWidth = () => {
    setWidths([...widths, '']);
  };

  const handleLengthChange = (e) => {
    setLength(e.target.value);
  };

  const handleWidthChange = (index, e) => {
    const newWidths = [...widths];
    newWidths[index] = e.target.value;
    setWidths(newWidths);
  };

  const handleConfirmRecommendation = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/recommend-tools', {
        cuttingLength: parseFloat(length),
        cuttingWidths: widths.map(width => parseFloat(width)),
      });
      setRecommendedTools(response.data);
      setSelectedTools(response.data.map(tool => tool._id));
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert('刀具不足');
      } else {
        console.error('Error recommending tools:', error);
      }
    }
  };

  const handleCancel = () => {
    onBackClick();
  };

  const handleToolSelectionChange = (index, e) => {
    const newSelectedTools = [...selectedTools];
    newSelectedTools[index] = e.target.value;
    setSelectedTools(newSelectedTools);
  };

  const handleConfirmSelection = async () => {
    try {
      await axios.post('http://localhost:5000/api/confirm-tools', {
        selectedTools,
        cuttingLength: parseFloat(length)
      });

      // Save work record for each tool
      for (const toolId of selectedTools) {
        const tool = allTools.find(t => t._id === toolId);
        if (tool) {
          await axios.post('http://localhost:5000/api/work', {
            tool_name: tool.name,
            maxDistance: tool.maxDistance,
            remainingDistance: tool.remainingDistance - parseFloat(length)
          });
        }
      }

      alert('工具使用成功');
      onSuccess(); // Navigate back to the home page on success
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert('刀具不足');
      } else {
        console.error('Error confirming tools:', error);
      }
    }
  };

  return (
    <>
      <h2 className="smart-cutting-title">智慧排刀</h2>
      <h3 className="notion">請勿輸入餘料寬度</h3>
      <div className="smart-cutting-form">
        <div className="form-row">
          <label>
            切割長度:
            <input
              type="number"
              step="0.01"
              name="length"
              value={length}
              onChange={handleLengthChange}
            />
          </label>
        </div>
        {widths.map((width, index) => (
          <div className="form-row" key={index}>
            <label>
              切割寬度:
              <input
                type="number"
                step="0.01"
                name="width"
                value={width}
                onChange={(e) => handleWidthChange(index, e)}
              />
            </label>
            {index === widths.length - 1 && (
              <button className="small-button add-button" onClick={handleAddWidth}>+</button>
            )}
          </div>
        ))}
        <div className="form-buttons">
          <button className="small-button" onClick={handleConfirmRecommendation}>確認</button>
          <button className="small-button" onClick={handleCancel}>取消</button>
        </div>
      </div>
      {recommendedTools.length > 0 && (
        <div className="recommended-tools">
          <h3>推薦工具</h3>
          {recommendedTools.map((tool, index) => (
            <div key={index} className="form-row">
              <label>
                刀具 {index + 1}
                <select
                  value={selectedTools[index]}
                  onChange={(e) => handleToolSelectionChange(index, e)}
                >
                  {allTools.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} - 剩餘使用距離: {t.remainingDistance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
          <div className="form-buttons">
            <button className="small-button" onClick={handleConfirmSelection}>確認使用</button>
          </div>
        </div>
      )}
    </>
  );
}

function WorkRecords({ onBackClick }) {
  const [workRecords, setWorkRecords] = useState([]);

  useEffect(() => {
    const fetchWorkRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/work');
        setWorkRecords(response.data);
      } catch (error) {
        console.error('Error fetching work records:', error);
      }
    };
    fetchWorkRecords();
  }, []);

  return (
    <>
      <h2 className="work-records-title">工作紀錄</h2>
      <div className="work-records-button-container">
        <button className="small-button" onClick={onBackClick}>返回</button>
      </div>
      <div className="table-container">
        <table className="work-table">
          <thead>
            <tr>
              <th>時間</th>
              <th>刀具名稱</th>
              <th>最大使用距離</th>
              <th>剩餘使用距離</th>
              <th>健康度</th>
            </tr>
          </thead>
          <tbody>
            {workRecords.map((record) => (
              <tr key={record._id}>
                <td>{new Date(record.time).toLocaleString()}</td>
                <td>{record.tool_name}</td>
                <td>{record.maxDistance.toFixed(2)}</td>
                <td>{record.remainingDistance.toFixed(2)}</td>
                <td>{(record.health * 100).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
