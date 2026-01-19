import { useState, useEffect, useRef } from 'react';
import './TabsWithTable.css';

function TabsWithTable({
    tabs = [],
    defaultTab = null,
    actionButton = null,
    onTabChange = null
}) {
    const [tabActiva, setTabActiva] = useState(defaultTab || tabs[0]?.key);
    const scrollPositionRef = useRef(0);
    const isScrollingProgrammatically = useRef(false);

    useEffect(() => {
        const containers = document.querySelectorAll('.table-container');
        
        const handleScroll = (e) => {
            if (isScrollingProgrammatically.current) return;
            
            scrollPositionRef.current = e.target.scrollTop;
            
            containers.forEach(container => {
                if (container !== e.target) {
                    isScrollingProgrammatically.current = true;
                    container.scrollTop = e.target.scrollTop;
                    isScrollingProgrammatically.current = false;
                }
            });
        };

        containers.forEach(container => {
            container.addEventListener('scroll', handleScroll);
        });

        if (scrollPositionRef.current > 0) {
            containers.forEach(container => {
                isScrollingProgrammatically.current = true;
                container.scrollTop = scrollPositionRef.current;
                isScrollingProgrammatically.current = false;
            });
        }

        return () => {
            containers.forEach(container => {
                container.removeEventListener('scroll', handleScroll);
            });
        };
    }, [tabActiva]);

    const handleTabChange = (tabKey) => {
        setTabActiva(tabKey);
        if (onTabChange) {
            onTabChange(tabKey);
        }
    };

    if (!tabs || tabs.length === 0) {
        return <div>No hay pestañas configuradas</div>;
    }

    return (
        <div className="custom-tabs-container">
            <div className="tabs-header-container">
                <div className="custom-tabs-list">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={`custom-tab-trigger ${tabActiva === tab.key ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                {actionButton && (
                    <div className="insert-caja-conceptos">
                        {actionButton}
                    </div>
                )}
            </div>

            <div className="custom-tabs-content">
                {tabs.map((tab) => (
                    <div 
                        key={tab.key} 
                        className="custom-tab-pane"
                        style={{ display: tabActiva === tab.key ? 'block' : 'none' }}
                    >
                        {tab.content}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TabsWithTable;