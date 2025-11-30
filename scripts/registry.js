window.ereStrategies = [];

window.registerStrategy = function (strategy) {
    console.log("Registrando estrategia", strategy.name);
    window.ereStrategies.push(strategy);
};
