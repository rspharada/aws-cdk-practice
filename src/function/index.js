exports.handler = async (event) => {
	console.log(process.env.NAME)
	console.log(event)
	// TODO implement
	const response = {
		statusCode: 200,
		body: JSON.stringify('Hello from Lambda!'),
	}
	return response
}
