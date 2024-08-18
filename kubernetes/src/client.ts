import { KubeConfig, CoreV1Api } from '@kubernetes/client-node';

const kc = new KubeConfig();
  kc.loadFromDefault();
  
  const kubeClient = kc.makeApiClient(CoreV1Api);
  
  const main = async () => {
      try {
          const configName = "test-configmap-name";
          const configNamespace = "default";
          const { body: a } = await kubeClient.createNamespacedConfigMap(
            configNamespace,
            {
                apiVersion: 'v1',
                kind: 'ConfigMap',
                metadata: {
                  name: 'example-configmap', // Name of the ConfigMap
                  labels: {
                    app: 'example', // Optional: add labels to the ConfigMap
                  },
                },
                data: {
                    'config.filteringKeywords': "d",
                },
          })

          // const { body: b } = await kubeClient.patchNamespacedConfigMap(
          //   configName,
          //   configNamespace,
          //   {
          //       data: {
          //           'config.filteringKeywords': "d",
          //       },
          //   },
          //   undefined,
          //   undefined,
          //   undefined,
          //   undefined,
          //   undefined,
          //   {
          //       headers: {
          //           'Content-Type': 'application/merge-patch+json',
          //       },
          //   },
          // );

          // const { body: c } = await kubeClient.readNamespacedConfigMap(
          //   configName,
          //   configNamespace,
          // );

          // console.log(podsRes.body);
      } catch (err) {
          console.error(err);
      }
  };
  
  main();