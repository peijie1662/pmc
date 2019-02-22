import axios from 'axios'
import GB from '../global.vue'

let base = GB.srvurl;

export const login = params => {return axios.post(`${base}/login`,params).then(res => res.data);};
export const getVessel = params => {return axios.post(`${base}/vessel`,params).then(res => res.data);};
export const getImportBays = params => {return axios.post(`${base}/import`,params).then(res => res.data);};
export const getExportBays = params => {return axios.post(`${base}/export`,params).then(res => res.data);};