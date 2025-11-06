/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import React, { useState } from 'react';
import TextAreaBox from './components/TextAreaBox';
import { Detail, type Details } from './components/types';
import './style/index.css';
import './style/style.css';
import './elements/counter-element';
import { Link } from 'react-router-dom';


const RootPage = () => {
  const [details, setDetails] = useState<Details>(new Detail());
  const toolbar = document.getElementById('toolbar');
  const contentDiv = document.getElementById('content');
  
  // Handle Ctrl+Enter for submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey) && e.key === 'Enter' && details.text.length > 0 && details.charsLeft >= 0) {
      alert('Tweet: '+ details.text); // Replace with API call
    };
  }

  // Function to apply formatting (B, I, U)
  function applyFormat(command: string) {
    // document.execCommand handles the formatting directly on the selected text
    document.execCommand(command, false);
    
    // After applying, hide the toolbar
    toolbar!.style.display = 'none';
  }

  function handleMouseUp() {
    const selection = window.getSelection();
    console.log(selection)

    if (selection && selection.toString().length >  0 && toolbar) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      const containerRect = contentDiv?.getBoundingClientRect();

      toolbar.style.left = ((rect?.left! - containerRect?.left! + (rect?.width! / 2) - (toolbar.offsetWidth / 2)) - 40)+ 'px';
      toolbar.style.top = ((rect?.top - containerRect?.top! + contentDiv?.scrollTop! - toolbar.offsetHeight - 5) + 23) + 'px';
      toolbar.style.display = 'block';
    } else {
      toolbar!.style.display = 'none';
    }
  }
  
  return (
    <div className="compose-box">
      <div className='navigation'>
        <Link to="/">Home</Link>
        <Link to="/chat">Chat</Link>
      </div>
      <h2>RootPage is rendering!</h2>
      <TextAreaBox charLimit={1500} getDetails={setDetails} height={150} minHeight={100} onKeyDown={handleKeyDown}/>
      <button disabled={details.text.length === 0 || details.charsLeft < 0} className="tweet-button">
        Tweet
      </button>
      <div className={`char-counter ${details.charsLeft <= 20 ? 'warning' : ''} ${details.charsLeft <= 0 ? 'error' : ''}`}>
        {details.charsLeft}
      </div>
      <h2>Preview</h2>
      <hr/>
      <counter-element></counter-element>
      <pre id='content' onMouseUp={handleMouseUp} contentEditable style={{ color: "white" }}>
        <div id="toolbar" className="toolbar">
          <button onClick={() => applyFormat('bold')}><b>B</b></button>
          <button onClick={() => applyFormat('italic')}><i>I</i></button>
          <button onClick={() => applyFormat('underline')}><u>U</u></button>
        </div>
        {details.highlightedText}
      </pre>
    </div>
  );
};

export default RootPage;
