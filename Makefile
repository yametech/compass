default:
	docker build -t yametech/compass:v0.1.3 -f Dockerfile .
	docker push yametech/compass:v0.1.3