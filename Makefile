default:
	docker build -t yametech/compass:v0.1.2 -f Dockerfile .
	docker push yametech/compass:v0.1.2