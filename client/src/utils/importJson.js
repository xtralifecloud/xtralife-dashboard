export const checkFileName = (filename, expectedType, expectedDomain, action) => {
    if(action === null) action = 'replace'
    const extension = (filename.split('.'))[(filename.split('.')).length-1];
    //const env = filename.split('-')[0];
    const domain = filename.split('-')[1];
    const type = filename.split('-')[2];

    if (extension.toLowerCase() !== 'json') {
        return 'wrongExtensionModal'
    }

    if (type !== expectedType) {
        return 'wrongTypeModal';
    }

    if (domain !== expectedDomain) {
        return 'confirmDomainModal'
    }

/*     if (confirm(`Are you sure you want to ${action} this data with data from ${env}? `)) {
        return true;
    } else { return false; } */
}

export const readFileAsJson = (file, cb) => {
    const filereader = new FileReader();
    filereader.onloadend = function() {
        const jsonContents = JSON.parse(filereader.result);
        return cb(jsonContents);
    };

    return filereader.readAsText(file);
}