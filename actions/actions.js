import axios from "axios";

export const callAPI = (data) => {
  // const deviceId = (`${Device.brand} ${Device.deviceName}`);
  const url = "https://europe-west3-merr-taxi.cloudfunctions.net/registerLocation";

  console.log(data, 'payload');
  return axios({
    method: 'POST', 
    url,
    data
  })
  .then( response => {
    // console.log(response, '::Response from server');
  })
  .catch(error => {
    // console.log(error, '::ERROR HTTP POST');
  });
}
