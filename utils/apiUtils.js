// //************************************************************************** */
// export async function interceptAndValidateApi(page,config) {
//   const {
//     urlPattern,
//     method,
//     expectedRequestBody,
//     expectedResponse,
//   } = config;

//   const interceptedData = {};

//   const requestPromise = new Promise((resolve, reject) => {
//     page.on('request', async (request) => {
//       if (
//         request.url().match(urlPattern) &&
//         (!method || request.method().toLowerCase() === method.toLowerCase())
//       ) {
//         const postData = request.postData();
//         const parsedData = postData ? JSON.parse(postData) : null;

//         interceptedData.request = {
//           url: request.url(),
//           method: request.method(),
//           headers: request.headers(),
//           postData: parsedData,
//         };

//         // ✅ Print request
//         console.log('\n📤 === Intercepted Request ===');
//         console.log(`URL: ${request.url()}`);
//         console.log(`Method: ${request.method()}`);
//         console.log('Headers:', request.headers());
//         console.log('Body:', parsedData);

//         if (expectedRequestBody) {
//           for (const key in expectedRequestBody) {
//             if (parsedData?.[key] !== expectedRequestBody[key]) {
//               return reject(
//                 new Error(`❌ Request mismatch for "${key}" – Expected: ${expectedRequestBody[key]} | Got: ${parsedData?.[key]}`)
//               );
//             }
//           }
//           console.log('✅ Request body validated');
//         }

//         resolve();
//       }
//     });
//   });

//   const responsePromise = new Promise((resolve, reject) => {
//     page.on('response', async (response) => {
//       if (
//         response.url().match(urlPattern) &&
//         (!method || response.request().method().toLowerCase() === method.toLowerCase())
//       ) {
//         let body = {};
//         try {
//           body = await response.json();
//         } catch (e) {
//           console.warn('⚠️ Could not parse response as JSON');
//         }

//         interceptedData.response = {
//           url: response.url(),
//           status: response.status(),
//           body,
//         };

//         // ✅ Print response
//         console.log('\n📥 === Intercepted Response ===');
//         console.log(`URL: ${response.url()}`);
//         console.log(`Status: ${response.status()}`);
//         console.log('Body:', body);

//         if (expectedResponse) {
//           for (const key in expectedResponse) {
//             if (body?.[key] !== expectedResponse[key]) {
//               return reject(
//                 new Error(`❌ Response mismatch for "${key}" – Expected: ${expectedResponse[key]} | Got: ${body?.[key]}`)
//               );
//             }
//           }
//           console.log('✅ Response body validated');
//         }

//         resolve();
//       }
//     });
//   });

//   await Promise.all([requestPromise, responsePromise]);

//   return interceptedData;
// }

export async function interceptAndValidateApi(page, config) {
  const {
    urlPattern,
    method,
    expectedRequestBody,
    expectedResponse,
  } = config;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`❌ Timed out waiting for API call: ${urlPattern}`));
    }, 10000); // 10 seconds max wait

    page.on('request', async (request) => {
      try {
        if (
          request.url().includes(urlPattern) &&
          (!method || request.method().toLowerCase() === method.toLowerCase())
        ) {
          const postData = request.postData();
          const parsedBody = postData ? JSON.parse(postData) : null;

          console.log('📤 Request:', request.url(), parsedBody);

          if (expectedRequestBody) {
            for (const key in expectedRequestBody) {
              if (parsedBody?.[key] !== expectedRequestBody[key]) {
                clearTimeout(timeout);
                return reject(
                  new Error(`❌ Request mismatch for "${key}" – Expected: ${expectedRequestBody[key]}, Got: ${parsedBody?.[key]}`)
                );
              }
            }
          }

          // Wait for the response event for this request
          page.on('response', async (response) => {
            if (response.url().includes(urlPattern)) {
              const json = await response.json();
              console.log('📥 Response:', json);

              if (expectedResponse) {
                for (const key in expectedResponse) {
                  if (json[key] !== expectedResponse[key]) {
                    clearTimeout(timeout);
                    return reject(
                      new Error(`❌ Response mismatch for "${key}" – Expected: ${expectedResponse[key]}, Got: ${json[key]}`)
                    );
                  }
                }
              }

              clearTimeout(timeout);
              resolve({ request: parsedBody, response: json });
            }
          });
        }
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });
  });
}
