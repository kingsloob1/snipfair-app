function gotDevices(deviceInfos) {
    // Look for the Reincubate Camo video input device.
    var deviceId;
    // eslint-disable-next-line no-undef
    for (deviceInfo of deviceInfos) {
        if (
            // eslint-disable-next-line no-undef
            deviceInfo.kind === 'videoinput' &&
            // eslint-disable-next-line no-undef
            deviceInfo.label === 'OBS Virtual Camera'
        ) {
            // eslint-disable-next-line no-undef
            deviceId = deviceInfo.deviceId;
            break;
        }
    }
    if (deviceId) {
        const constraints = {
            audio: true,
            video: { deviceId: { exact: deviceId } },
        };
        navigator.mediaDevices.getUserMedia(constraints).then(gotStream);
    } else {
        console.error('Unable to find OBS video input device.');
    }
}
function gotStream(stream) {
    // Tell the vMix Call session to switch to a different stream.
    try {
        // eslint-disable-next-line no-undef
        session.gotLocalStream(stream);
    } catch {
        console.error('Unable to trigger vMix Call session stream update.');
    }
}
// Ask the browser for a list of media devices.
navigator.mediaDevices.enumerateDevices().then(gotDevices);

async function switchCamera(deviceId) {
    try {
        // Find the video element in the page (adjust selector if needed)
        const videoElement = document.querySelector('video');
        if (!videoElement) {
            console.error('No video element found on the page.');
            return;
        }

        // Get the current media stream (if any)
        const currentStream = videoElement.srcObject;
        if (currentStream) {
            // Stop all tracks in the current stream
            currentStream.getTracks().forEach((track) => track.stop());
        }

        // Request a new stream with the specified deviceId
        const constraints = {
            video: { deviceId: { exact: deviceId } },
        };
        const newStream =
            await navigator.mediaDevices.getUserMedia(constraints);

        // Assign the new stream to the video element
        videoElement.srcObject = newStream;
        console.log('Camera switched successfully to device:', deviceId);
    } catch (error) {
        console.error('Error switching camera:', error);
    }
}

navigator.mediaDevices.enumerateDevices().then((devices) => {
    devices.forEach((device) => {
        if (device.kind === 'videoinput') {
            console.log(`Device: ${device.label}, ID: ${device.deviceId}`);
        }
    });
});

switchCamera('id');
