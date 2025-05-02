interface SendMessageProps {
  event: string;
  [key: string]: unknown;
}
export const sendMessage = ({event, ...data} : SendMessageProps) => {

  window.postMessage({ from:"react", event: event, ...data }, '*');
  return 
}


