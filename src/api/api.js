import axios from 'axios'
import GB from '../global.vue'

let base = GB.srvurl;

export const login = params => {return axios.post(`${base}/login`,params).then(res => res.data);};
export const getVessel = params => {return axios.post(`${base}/vessel`,params).then(res => res.data);};
export const getImportBays = params => {return axios.post(`${base}/import`,params).then(res => res.data);};
export const getExportBays = params => {return axios.post(`${base}/export`,params).then(res => res.data);};
export const getYP = params => {return axios.post(`${base}/vessels/yp`,params).then(res => res.data);};
export const getYB = params => {return axios.post(`${base}/vessels/yb`,params).then(res => res.data);};
export const getZyqk = params => {return axios.post(`${base}/vessels/zyqk`,params).then(res => res.data);};

//装船堆场PA预警
export const getLywQds = params => {return axios.post(`${base}/lyw/qds`,params).then(res => res.data);};
export const getLywActiveQueues = params => {return axios.post(`${base}/lyw/activequeues`,params).then(res => res.data);};
export const getLywPendingCwps = params => {return axios.post(`${base}/lyw/pendingcwps`,params).then(res => res.data);};
export const getLywPendingCntrs = params => {return axios.post(`${base}/lyw/pendingcntrs`,params).then(res => res.data);};