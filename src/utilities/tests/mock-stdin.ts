const mockStdin = async (data: string): Promise<void> => {
  const dataPromise = new Promise<void>((resolve) => {
    process.nextTick(() => {
      process.stdin.emit('data', data);
      resolve();
    });
  });
  // Push data to mock stdin in next tick to avoid race conditions
  const endPromise = new Promise<void>((resolve) => {
    process.nextTick(() => {
      process.stdin.emit('end');
      resolve();
    });
  });
  await dataPromise;
  await endPromise;
};

export default mockStdin;
