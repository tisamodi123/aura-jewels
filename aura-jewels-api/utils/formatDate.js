function formatDate(date) {
    const options = {       
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata',
      hour12: true
    };
    return new Date(date).toLocaleDateString('en-GB', options);
}

export default formatDate 