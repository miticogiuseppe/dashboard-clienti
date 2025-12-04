import axios from "axios";

async function restGet(url) {
  return new Promise((resolve, reject) => {
    axios
      .get(process.env.NEXT_PUBLIC_API_URI + "/" + url, {})
      .then(function (response) {
        let data = response.data;
        resolve(data);
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });
  });
}
async function restGetFile(url) {
  return new Promise((resolve, reject) => {
    axios
      .get(process.env.NEXT_PUBLIC_API_URI + "/" + url, {
        responseType: "blob",
      })
      .then(function (response) {
        // Estrarre il nome del file dai header
        const contentDisposition = response.headers["content-disposition"];
        let filename = "file.csv";
        if (contentDisposition && contentDisposition.includes("filename="))
          filename = contentDisposition
            .split("filename=")[1]
            .replace(/"/g, "")
            .trim();
        resolve({
          data: response.data,
          filename,
        });
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });
  });
}

async function restPost(url, data) {
  return new Promise((resolve, reject) => {
    axios
      .post(process.env.NEXT_PUBLIC_API_URI + "/" + url, data, {})
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });
  });
}
async function restRequest(url, data, method) {
  let config = {
    method: method,
    data,
    url: process.env.NEXT_PUBLIC_API_URI + "/" + url,
  };

  return new Promise((resolve, reject) => {
    axios(config)
      .then(function (response) {
        resolve(response.data);
      })
      .catch(function (error) {
        console.log(error);
        reject(error);
      });
  });
}

export { restPost, restGetFile, restRequest, restGet };
