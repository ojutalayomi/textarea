import React, { useState, useEffect, useRef, useMemo } from 'react';
import twitter, { EntityWithIndices } from 'twitter-text';
import { TextAreaBoxProps } from './types';

/**
 * The text area box
 * 
 * @param charLimit - The maximum number of characters allowed in the text area
 * @param height - The height of the text area
 * @param minHeight - The minimum height of the text area
 * @param getDetails - A function to get the details of the text area
 * @returns The text area box
 */
const TextAreaBox = ({ charLimit = 480, height = 450, minHeight = 250, getDetails }: TextAreaBoxProps) => {
    const [text, setText] = useState('');
    const [text1, setText1] = useState('');
    const [charsLeft, setCharsLeft] = useState(charLimit);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const regex = useMemo(() => /\s*<limit>([\s\S]*?)<\/limit>/, []);
  
    function getFinalText(value: string, charLimit: number) {
      let finalText = '';
      if (value.length > charLimit) {
        // If already wrapped with <limit>, preserve as is
        if (value.includes('<limit>') && value.includes('</limit>')) {
          finalText = value;
        } else {
          finalText = value.slice(0, charLimit) + `<limit>${value.slice(charLimit)}</limit>`;
        }
      } else {
        finalText = value;
      }
      return finalText;
    }
    
    /**
     * Handle text input
     */
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ClipboardEvent<HTMLTextAreaElement>) => {
      let value: string;
      if ('clipboardData' in e) {
        e.preventDefault();
        value = e.clipboardData.getData('text');
      } else if ('target' in e && e.target && e.target.value !== undefined) {
        value = e.target.value;
      } else {
        value = '';
      }
  
      const finalText = getFinalText(value, charLimit);
      const re = regex.exec(finalText);
      let theText = finalText.slice(0, charLimit);
      if (finalText.length > charLimit && re) {
        theText += re[1];
      }
  
      setText(theText);
      setText1(finalText);
    };
  
    useEffect(() => {
      getDetails?.({ charsLeft, text: text1 });
    }, [charsLeft, getDetails, text1]);
  
    // Auto-expand textarea and update counter
    useEffect(() => {
      const textarea = textareaRef.current;
      textarea!.style.height = 'auto';
      textarea!.style.height = `${Math.min(textarea!.scrollHeight, textarea!.previousElementSibling!.clientHeight)}px`;
      setCharsLeft(charLimit - text.length);
    }, [charLimit, height, text]);
  
    // Helper to determine entity type and generate href
    const getEntityProps = (entity: EntityWithIndices) => {
      if ('hashtag' in entity) {
        return {
          type: 'hashtag',
          href: `https://x.com/hashtag/${encodeURIComponent(entity.hashtag)}`,
          label: `Search for hashtag ${entity.hashtag}`,
        };
      }
      if ('screenName' in entity) {
        return {
          type: 'mention',
          href: `https://x.com/${encodeURIComponent(entity.screenName)}`,
          label: `View profile for ${entity.screenName}`,
        };
      }
      if ('url' in entity) {
        return {
          type: 'url',
          href: entity.url, // Already normalized by twitter-text
          label: `Open link ${entity.url}`,
        };
      }
      if ('cashtag' in entity) {
        return {
          type: 'cashtag',
          href: `https://x.com/search?q=${encodeURIComponent(entity.cashtag)}`,
          label: `Search for cashtag ${entity.cashtag}`,
        };
      }
      return { type: '' };
    };
  
    // useEffect(() => {
    //   const re = regex.exec(text1 || '');
    //   console.log('re', re);
    //   if (re) {
    //     console.log(re[1]);
    //   }
    // }, [regex, text, text1])
  
    // Memoized highlighted text using twitter-text for robust parsing
    const highlightedText = useMemo(() => {
      const re = regex.exec(text1);
  
      const entityHandler = (text: string, limit = true) => {
        const theText = text.length > charLimit && limit ? text.slice(0, charLimit) : text;
        
        // Extract entities with indices (robust handling of Unicode, punctuation, etc.)
        const entities = twitter.extractEntitiesWithIndices(theText);
  
      // Sort by start index (though usually pre-sorted)
      entities.sort((a: EntityWithIndices, b: EntityWithIndices) => a.indices[0] - b.indices[0]);
  
        const parts: React.ReactElement[] = [];
        let lastIndex = 0;

        entities.forEach((entity: EntityWithIndices) => {
          // Plain text before entity
          const before = theText.slice(lastIndex, entity.indices[0]);
          if (before) {
            parts.push(<span key={parts.length}>{before}</span>);
          }
  
          // Highlighted entity
          const entityText = theText.slice(entity.indices[0], entity.indices[1]);
          const { type, href, label } = getEntityProps(entity);
          parts.push(
            <a
              key={parts.length}
              className={`highlight ${type}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              {entityText}
            </a>
          );
  
          lastIndex = entity.indices[1];
        });
  
        // Remaining plain text
        const after = theText.slice(lastIndex);
        if (after) {
          parts.push(<span key={parts.length}>{after}</span>);
        }
        return { parts, theText };
      }
  
      const { parts } = entityHandler(text);
  
      if (text.length > charLimit && re) {
        parts.push(<span key={parts.length} className='limit-content'>{entityHandler(re[1], false).parts}</span>);
      }
      
      return parts;
    }, [charLimit, regex, text, text1]);
  
    // useEffect(() => {
    //   const re = regex.exec(text1);
    //   const theText = text.slice(0, charLimit);
  
    //   if (text.length > charLimit && re) {
    //     setText(theText + re[1]);
    //   }
    // }, [charLimit, regex, text, text1]);
  
    // Handle Ctrl+Enter for submission
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.ctrlKey && e.key === 'Enter' && text.length > 0 && charsLeft >= 0) {
        console.log('Tweet:', text); // Replace with API call
        setText('');
        setText1('');
      }
    };
  
    return (
      <div className="textarea-wrapper" style={{ maxHeight: `${height}px`, overflow: 'auto' }}>
        <div className="highlight-layer" style={{ minHeight: `${minHeight}px` }}>{highlightedText}</div>
        <textarea
          id='textarea'
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="What's happening?"
          rows={1}
          // maxLength={charLimit}
          style={{ minHeight: `${minHeight}px` }}
          onPaste={handleInput}
        />
      </div>
    );
  };

export default TextAreaBox;
