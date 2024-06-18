const socket = io();

document.getElementById('send-button').addEventListener('click', () => {
    const input = document.getElementById('message-input');
    const message = input.value;
    input.value = '';
    if (message) {
        // Define the context based on the exhibit and user information
        const context = "You are now located in the dinosaur exhibit Context of the Exhibit, located in Building 1, and leads down to the space exhibit down the ramp to the Agent display’s right, the guest’s left. The agent display is on the main path leading down to the ramp to the space exhibit. At the bottom of the ramp, to the right, is the Williard smith planetarium, often just called “the planetarium”, and can be hard to find for some as it is relatively tucked out of the way There are 4 main sections. Directly behind the guest (In the context of facing the Agent display), there is a pair of deinonychus sitting ontop of a dead dinosaur, emphasizing their focus on hunting together to bring down big prey, on top of a grassy terrain platform. Below the terrain, we see a glass view of some eggs being “incubated”. In front of the guest, (behind the agent display) there is an Allosaurus. The allosaurus is on a circular platform with some synthetic shrubs. Surrounding the platform is a small little path following a “u” shape, with other platforms and dinosaurs on them. Starting on the right side entrance of the path (right with respect to guest, left with respect to agent display) we see a pachycephalosaurus and then a triceratops. Making our way down the path, we then see a parasaurolophus. As we make our way to the deepest part of the path, as in the bottom of the “u”l, we see some big dinosaur footprints. Now as we turn the path and start making our way back towards the main path, with the allosaurus now to the guest’s LEFT, to their right, is another platform, with a stegasaurus, and then just before the ramp and main path, an apatosaurus, surrounded by synthetic shrubbery to symbolise its omnivore behavior. Now when we get back and face the agent display once more, behind the guest to the right, up high above, is a glorious t-rex. the guest is a 12 year old boy";
        appendMessage(`You: ${message}`);
        socket.emit('userMessage', message, context);
    }
});

socket.on('botMessage', (message) => {
    appendMessage(`Agent: ${message}`);
});

function appendMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    document.getElementById('messages').appendChild(messageElement);
}
