// Command activation system with Jarvis trigger

const commandActivationSystem = () => {
    const commands = {
        runFvr: () => {
            console.log('Running FVR...');
            // Add logic for FVR
        },
        runXmDurationTimer: () => {
            console.log('Starting XM Duration Timer...');
            // Timer logic goes here
        },
        stopCommand: () => {
            console.log('Stopping the command...');
            // Logic to stop the command
        },
    };

    const jarvisTrigger = (input) => {
        if (input.startsWith('Jarvis')) {
            const command = input.split(' ')[1];
            if (commands[command]) {
                commands[command]();
            } else {
                console.log('Command not recognized.');
            }
        }
    };

    // Example usage
    jarvisTrigger('Jarvis runFvr');
    jarvisTrigger('Jarvis runXmDurationTimer');
    jarvisTrigger('Jarvis stopCommand');
};

commandActivationSystem();
