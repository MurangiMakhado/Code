
const base_url  = "http://127.0.0.1:8000/api/";

// Wrapped axios helpers with better logging and error messages
async function post(endpoint, data) {
    try {
        return await axios.post(base_url + endpoint, data, {
            headers: {
                'Authorization': localStorage.getItem('authToken')
            }
        });
    } catch (err) {
        console.error(`API POST ${endpoint} failed:`, err);
        throw err;
    }
}

async function get(endpoint, params) {
    try {
        return await axios.get(base_url + endpoint, {
            params: params,
            headers: {
                'Authorization': localStorage.getItem('authToken')
            }
        });
    } catch (err) {
        console.error(`API GET ${endpoint} failed:`, err);
        throw err;
    }
}

async function put(endpoint, data) {
    try {
        return await axios.put(base_url + endpoint, data, {
            headers: {
                'Authorization': localStorage.getItem('authToken')
            }
        });
    } catch (err) {
        console.error(`API PUT ${endpoint} failed:`, err);
        throw err;
    }
}

async function del(endpoint) {
    try {
        return await axios.delete(base_url + endpoint, {
            headers: {
                'Authorization': localStorage.getItem('authToken')
            }
        });
    } catch (err) {
        console.error(`API DELETE ${endpoint} failed:`, err);
        throw err;
    }
}