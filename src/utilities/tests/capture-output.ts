/**
 * Test helper function to capture console output from a function
 *
 * *Developer's Note:*
 * Because Yargs is a CLI library, we can best test the functionality of our abstract
 * classes and command executions by capturing console output via this function.
 *
 * @param fn - Function to execute and capture output
 * @returns Promise<{ output: string; error: string }> Containing all console output
 */
function captureOutput(
  fn: () => Promise<unknown>,
): Promise<{ output: string; error: string }> {
  const originalLog = console.log;
  const originalError = console.error;
  let output = '';
  let error = '';
  console.log = (msg) => {
    output += msg + '\n';
  };

  console.error = (msg) => {
    error += msg + '\n';
  };

  return fn().then(() => {
    console.log = originalLog;
    console.error = originalError;
    return {
      output: output.trim(),
      error: error.trim(),
    };
  });
}

export default captureOutput;
