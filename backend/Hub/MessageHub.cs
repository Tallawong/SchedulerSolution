﻿using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebApi.Hub
{
    public class MessageHub : Hub<IMessageHubClient>
    {
        private readonly ILogger<MessageHub> log;

        public MessageHub(ILogger<MessageHub> logger)
        {
            log = logger;
        }
        public async Task SendUpdatesToUser(string id)
        {
            log.LogInformation("Before Clients.Caller.SendUpdate() called");
            await Clients.Caller.SendUpdate(id);
            log.LogInformation("After Clients.Caller.SendUpdate() called");
        }
    }
}
