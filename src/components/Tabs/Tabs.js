import React, { useState } from 'react';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@tremor/react';
import "./Tabs.css";
import classnames from 'classnames';

const Tabs = ({ tabs }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <TabGroup index={activeIndex} onIndexChange={setActiveIndex}>
            <TabList className='tabs'>
                {tabs.map((tab, index) => (
                    <Tab key={index} className={classnames("tabs-titulo", tab.colorClass)}>
                        {tab.title}
                    </Tab>
                ))}
            </TabList>
            <TabPanels className='tabs-cuerpo-container'>
                {tabs.map((tab, index) => (
                    <TabPanel key={index} className={classnames("tabs-cuerpo", tab.colorClass)}>
                        {tab.content}
                    </TabPanel>
                ))}
            </TabPanels>
        </TabGroup>
    );
};

export default Tabs;