import * as urls from '../utils/urls';
import request from '@/utils/request';

export async function getGfyExperimentList() {
	let url = urls.getGfyExperimentListUrl();
	return request(url);
}

export async function getGfyExperiment(params) {
    let url = urls.getGfyExperimentUrl(params);
    return request(url);
}

export async function predictDiagnosis(body) {
    let url = urls.predictGfyDiagnosisUrl();
    return request(url, {
        method: 'POST',
        body: body,
    });
}

export async function getGfyEmrList() {
    let url = urls.getGfyEmrListUrl();
    return request(url);
}

export async function getGfyEmr(id) {
    let url = urls.getGfyEmrUrl(id);
    return request(url);
}
