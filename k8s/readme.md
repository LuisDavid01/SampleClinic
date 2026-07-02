# How to deploy to kubernetes

Im going to use minikube for this local example.

## TODO DIAGRAM

## chat websocket service

I have made a websocket pod with a single replica for now.
i have yet to figure out how to make the secerts work in local.

## api service

The nodejs api service powers the nextjs app with more complex
secrets yet to be implemented.

## web service

the nextjs frontend that is going to be the only one exposed to 
the outside world the rest are internal services for more security.

## gateway

a gateway of sorts. yet to be implemented.
