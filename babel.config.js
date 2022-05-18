module.exports = function (api) {
    api.cache(true);

    return {
        assumptions: {
            setPublicClassFields: true,
            privateFieldsAsProperties: true,
        },
        presets: [
            [
                "@babel/preset-env",
                {
                    useBuiltIns: "entry",
                    corejs: 3,
                },
            ],
        ],
    };
};
