// export const baseUrl = "http://localhost:5001/api";

// export const postRequest = async (url, body) => {
//   await fetch(url, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body,
//   });

//   const data = await response.json();
//   if (!response.ok) {
//     let message;

//     if (data?.message) {
//       message = data.message;
//     } else {
//       message = data;
//     }

//     return { error: true, message};
//   }
//   return data;
// };

export const baseUrl = "http://localhost:5001/api";

export const postRequest = async (url, body) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body, // Ensure body is passed correctly
    });

    const data = await response.json();
    if (!response.ok) {
      let message;

      if (data?.message) {
        message = data.message;
      } else {
        message = data;
      }

      return { error: true, message };
    }
    return data;
  } catch (error) {
    console.error("Error in postRequest:", error);
    return { error: true, message: error.message };
  }
};

