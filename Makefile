default:
	docker build -t yametech/compass:0.2.0 -f Dockerfile .
	docker push yametech/compass:0.2.0