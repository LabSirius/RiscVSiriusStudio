interface SendMessageProps {
    operation: string;
    data: Record<string, unknown>;
}

const SendMessage = ({operation, data} : SendMessageProps) => {

  window.postMessage({ from:"react", operation: operation, data: data }, '*');
  return 
}

export default SendMessage
