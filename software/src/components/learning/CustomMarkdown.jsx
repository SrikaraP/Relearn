import React from 'react';

const CustomMarkdown = ({ children }) => {
  if (!children) return null;

  const renderText = (text) => {
    // Basic bold parsing: **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const lines = children.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(<ul key={`ul-${elements.length}`}>{listItems}</ul>);
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    
    // Check for lists
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      inList = true;
      listItems.push(<li key={`li-${idx}`}>{renderText(trimmed.substring(2))}</li>);
      return;
    } else {
      flushList();
    }

    // Check for headings
    if (trimmed.startsWith('# ')) {
      elements.push(<h1 key={`h1-${idx}`}>{renderText(trimmed.substring(2))}</h1>);
      return;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={`h2-${idx}`}>{renderText(trimmed.substring(3))}</h2>);
      return;
    }
    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={`h3-${idx}`}>{renderText(trimmed.substring(4))}</h3>);
      return;
    }

    // Check for blockquotes
    if (trimmed.startsWith('> ')) {
      elements.push(<blockquote key={`bq-${idx}`}>{renderText(trimmed.substring(2))}</blockquote>);
      return;
    }

    // Default to paragraph if not empty
    if (trimmed) {
      elements.push(<p key={`p-${idx}`}>{renderText(trimmed)}</p>);
    } else {
      // Empty line, add a br just in case to maintain spacing
      elements.push(<br key={`br-${idx}`} />);
    }
  });

  flushList();

  return <div className="markdown-body">{elements}</div>;
};

export default CustomMarkdown;
