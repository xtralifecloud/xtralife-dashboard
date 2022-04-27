import { toast } from "react-toastify";

export const checkFileName = (filename, expectedType, expectedDomain, action) => {
    if(action === null) action = 'replace'
    const extension = (filename.split('.'))[(filename.split('.')).length-1];
    const env = filename.split('-')[0];
    const domain = filename.split('-')[1];
    const type = filename.split('-')[2];

    if (extension.toLowerCase() !== 'json') {
        toast.warn(`Incorrect file type. Found: ${extension} but expected .json`)
        return {state: "error"};
    }

    if (type !== expectedType) {
        toast.warn(`Wrong export type. Found: ${type} but expected ${expectedType}`)
        return {state: "error"};
    }

    if (domain !== expectedDomain) {
        return {state: "unexpectedDomain", domain: domain, expectedDomain: expectedDomain, env: env}
    }

    return {state: "success", action: action, env: env}
}

export const readFileAsJson = (file, cb) => {
    const filereader = new FileReader();
    filereader.onloadend = function() {
        const jsonContents = JSON.parse(filereader.result);
        return cb(jsonContents);
    };

    return filereader.readAsText(file);
}