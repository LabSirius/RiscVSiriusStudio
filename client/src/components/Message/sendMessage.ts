interface SendMessageProps {
  event: string;
    data: Record<string, unknown>;
}

export const sendMessage = ({event, data} : SendMessageProps) => {

  window.postMessage({ from:"react", event: event, data: data }, '*');
  return 
}


