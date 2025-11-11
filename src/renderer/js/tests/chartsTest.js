function RunTest() {
    const testData =`\`\`\`json-chart
    {
        "chartName": "Sales Comparison",
        "chartType": "column",
        "description": "Sample sales data showing unit sales across three product categories.",
        "data": [
            { "x": "A", "y": 50 },
            { "x": "B", "y": 30 },
            { "x": "C", "y": 50 }
        ]
    }\`\`\``
    //window.createLWTCharts('LWT Chart TS')
    //window.createJSCCharts(testData.chartName, testData.data, testData.description)
    window.ChartsInterpreter(data=testData, type='text')
}
RunTest();
