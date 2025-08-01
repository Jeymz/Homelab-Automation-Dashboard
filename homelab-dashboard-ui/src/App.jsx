import { useState } from 'react';
// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
// import './App.css';

const tabs = [
  {
    id: 'gitlab',
    label: 'GitLab',
    actions: [
      'GitLab Pipeline Status',
      'Pipeline Status (Forever)',
      'Stop Refresh',
      'Run Auto-Merge',
      'GitLab Assigned MRs',
    ],
  },
  {
    id: 'github',
    label: 'GitHub',
    actions: ['GitHub PR Diffs'],
  },
  {
    id: 'azure',
    label: 'Azure',
    actions: ['Azure DNS Zones'],
  },
  {
    id: 'namecheap',
    label: 'Namecheap',
    actions: ['Namecheap Domains'],
  },
  {
    id: 'wave',
    label: 'Wave',
    actions: ['Wave Customers'],
  },
];

function TabButton({ id, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-t-lg border-2 border-gray-darker border-b-0 focus:outline-none ${
        active
          ? 'bg-primary text-white font-semibold border-primary'
          : 'bg-gray-dark text-gray-200 hover:bg-gray-darker hover:text-accent'
      }`}
    >
      {label}
    </button>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('gitlab');

  return (
    <div className="min-h-screen bg-dark p-6 text-gray-200">
      <div className="mx-auto max-w-5xl rounded-lg bg-gray-dark p-6 shadow-lg">
        <h1 className="mb-6 flex items-center justify-center text-center text-2xl font-semibold text-white">
          <img
            src="/Images/Homelab%20Automation%20Manager.png"
            alt="Homelab Automation Dashboard"
            className="mr-3 h-12"
          />
          Homelab Automation Dashboard
        </h1>

        <div className="mb-6 flex justify-center space-x-2">
          {tabs.map((t) => (
            <TabButton
              key={t.id}
              id={t.id}
              label={t.label}
              active={activeTab === t.id}
              onClick={setActiveTab}
            />
          ))}
        </div>

        {tabs.map((t) => (
          <div key={t.id} className={activeTab === t.id ? 'block' : 'hidden'}>
            <div className="flex flex-wrap justify-center rounded-b-lg border-2 border-primary border-t-0 bg-gray-dark p-4 shadow-md">
              {t.actions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className={`m-2 rounded-md px-4 py-2 shadow bg-gray-darker text-gray-200 hover:bg-accent hover:text-dark${
                    action === 'Stop Refresh' ? ' bg-red-500 hover:bg-red-400' : ''
                  }`}
                  onClick={() => {}}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4 min-h-[120px] rounded-md bg-dark p-4 shadow-inner">
          Select a script to see output here.
        </div>
      </div>
    </div>
  );
}

export default App;
