import React, { useState } from 'react';
import TextAreaBox from './TextAreaBox';
import { Details } from './types';
import '../style/index.css';


const RootPage = () => {
  const [details, setDetails] = useState<Details>({ charsLeft: 0, text: '' });
  
  return (
    <div className="compose-box">
      <h2>RootPage is rendering!</h2>
      <TextAreaBox getDetails={setDetails} />
      <button disabled={details.text.length === 0 || details.charsLeft < 0} className="tweet-button">
        Tweet
      </button>
      <div className={`char-counter ${details.charsLeft <= 20 ? 'warning' : ''} ${details.charsLeft <= 0 ? 'error' : ''}`}>
        {details.charsLeft}
      </div>
    </div>
  );
};

export default RootPage;
