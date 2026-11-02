/**
 * SkillSwap Code Lab Controller
 * Multi-Language Code Compilation & Execution Engine
 * Supports: Python 3, Java (OpenJDK), C (GCC), C++ (GCC), JavaScript (Node.js)
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const COMPILER_MAP = {
  python: 'cpython-3.12.7',
  python3: 'cpython-3.12.7',
  c: 'gcc-13.2.0-c',
  cpp: 'gcc-13.2.0',
  'c++': 'gcc-13.2.0',
  java: 'openjdk-jdk-21+35',
  javascript: 'nodejs-20.17.0',
  js: 'nodejs-20.17.0',
  node: 'nodejs-20.17.0'
};

function normalizeString(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ');
}

function areOutputsEqual(actual, expected) {
  const normActual = normalizeString(actual);
  const normExpected = normalizeString(expected);

  if (normActual === normExpected) return true;

  // Boolean equivalence (e.g. true vs True, false vs False)
  if (normActual.toLowerCase() === normExpected.toLowerCase()) return true;

  // Try JSON equivalence (e.g. [0, 1] vs [0,1], ["1","2"] vs ["1", "2"])
  try {
    const actJson = JSON.parse(normActual.replace(/'/g, '"'));
    const expJson = JSON.parse(normExpected.replace(/'/g, '"'));
    if (JSON.stringify(actJson) === JSON.stringify(expJson)) return true;
  } catch (e) {}

  // Try numerical equivalence
  const numAct = Number(normActual);
  const numExp = Number(normExpected);
  if (!isNaN(numAct) && !isNaN(numExp) && numAct === numExp) return true;

  return false;
}

function cleanErrorTrace(errorStr) {
  if (!errorStr) return '';
  return errorStr
    .replace(/\/home\/wandbox\/prog\.py/g, 'solution.py')
    .replace(/prog\.py/g, 'solution.py')
    .replace(/prog\.java/g, 'Solution.java')
    .replace(/prog\.cpp/g, 'solution.cpp')
    .replace(/prog\.c/g, 'solution.c')
    .trim();
}

function generatePythonHarness() {
  return `

# --- SKILLSWAP AUTO HARNESS FOR PYTHON 3 ---
if __name__ == '__main__':
    import sys, json, ast, inspect, re

    raw = sys.stdin.read().strip()
    scope = {}
    if raw:
        norm_raw = re.sub(r',\\s*([a-zA-Z_][a-zA-Z0-9_]*\\s*=)', r'\\n\\1', raw)
        try:
            exec(norm_raw, {}, scope)
        except Exception:
            try:
                scope['_arg'] = ast.literal_eval(raw)
            except Exception:
                scope['_arg'] = raw

    target = None
    if 'Solution' in globals() and inspect.isclass(Solution):
        inst = Solution()
        methods = [m for m in dir(inst) if not m.startswith('_') and callable(getattr(inst, m))]
        if methods:
            target = getattr(inst, methods[0])
    
    if not target:
        funcs = [f for k, f in globals().items() if not k.startswith('_') and callable(f) and inspect.isfunction(f)]
        if funcs:
            target = funcs[0]

    if target:
        sig = inspect.signature(target)
        params = list(sig.parameters.keys())
        call_kwargs = {}
        for p in params:
            if p in scope:
                call_kwargs[p] = scope[p]
        
        if len(call_kwargs) < len(params) and len(scope) > 0:
            call_args = list(scope.values())[:len(params)]
            res = target(*call_args)
        else:
            res = target(**call_kwargs)

        if res is None:
            if 's' in scope: res = scope['s']
            elif 'nums1' in scope: res = scope['nums1']
            elif 'nums' in scope: res = scope['nums']

        if isinstance(res, bool):
            print("true" if res else "false")
        elif isinstance(res, (list, dict)):
            print(json.dumps(res, separators=(',', ':')))
        elif res is not None:
            print(res)
`;
}

function generateJsHarness(stdin = '') {
  return `

// --- SKILLSWAP AUTO HARNESS FOR JAVASCRIPT ---
(() => {
  const raw = ${JSON.stringify(stdin)}.trim();
  const env = {};
  if (raw) {
    const lines = raw.split(/\\n|,\\s*(?=[a-zA-Z_$][a-zA-Z0-9_$]*\\s*=)/);
    for (let line of lines) {
      if (line.includes('=')) {
        const eq = line.indexOf('=');
        const k = line.slice(0, eq).trim();
        const v = line.slice(eq + 1).trim();
        try { env[k] = JSON.parse(v.replace(/'/g, '"')); } catch(e) { env[k] = v; }
      } else {
        try { env['_arg'] = JSON.parse(raw.replace(/'/g, '"')); } catch(e) { env['_arg'] = raw; }
      }
    }
  }

  let res = undefined;
  if (typeof Solution !== 'undefined') {
    const sol = new Solution();
    const proto = Object.getPrototypeOf(sol);
    const methods = Object.getOwnPropertyNames(proto).filter(m => m !== 'constructor' && typeof sol[m] === 'function');
    if (methods.length > 0) {
      const fn = sol[methods[0]].bind(sol);
      res = fn(...Object.values(env));
    }
  } else {
    const candFns = [
      typeof isValid === 'function' ? isValid : null,
      typeof twoSum === 'function' ? twoSum : null,
      typeof isPalindrome === 'function' ? isPalindrome : null,
      typeof fizzBuzz === 'function' ? fizzBuzz : null,
      typeof reverseString === 'function' ? reverseString : null,
      typeof maxArea === 'function' ? maxArea : null,
      typeof threeSum === 'function' ? threeSum : null,
      typeof merge === 'function' ? merge : null
    ].filter(Boolean);
    if (candFns.length > 0) {
      res = candFns[0](...Object.values(env));
    }
  }

  if (res !== undefined) {
    if (typeof res === 'object') console.log(JSON.stringify(res));
    else console.log(res);
  }
})();
`;
}

async function runOnWandbox(compiler, code, stdin = '', attempt = 1) {
  try {
    const response = await globalThis.fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compiler, code, stdin })
    });

    if (!response.ok) {
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 400));
        return runOnWandbox(compiler, code, stdin, attempt + 1);
      }
      throw new Error(`Compiler service HTTP ${response.status}`);
    }

    const data = await response.json();
    const compErr = (data.compiler_error || data.compiler_message || '').trim();

    if (compErr.includes('Resource temporarily unavailable') && attempt < 2) {
      await new Promise(r => setTimeout(r, 500));
      return runOnWandbox(compiler, code, stdin, attempt + 1);
    }

    return {
      success: true,
      status: data.status,
      output: (data.program_output || '').trim(),
      compilerError: compErr,
      runtimeError: (data.program_error || '').trim(),
      signal: data.signal || ''
    };
  } catch (err) {
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 400));
      return runOnWandbox(compiler, code, stdin, attempt + 1);
    }
    return {
      success: false,
      error: err.message
    };
  }
}

// Ultra-fast Local JavaScript Runner
function runJsLocally(code, stdin = '') {
  return new Promise((resolve) => {
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `codelab_${Date.now()}_${Math.random().toString(36).slice(2)}.js`);
    
    const wrappedCode = `
      const fs = require('fs');
      const origReadFileSync = fs.readFileSync;
      fs.readFileSync = function(fd, options) {
        if (fd === 0 || fd === 'pipe:0' || fd === '/dev/stdin') {
          return Buffer.from(${JSON.stringify(stdin)});
        }
        return origReadFileSync.apply(this, arguments);
      };

      try {
        ${code}
      } catch (err) {
        console.error(err.stack || err.message || err);
        process.exit(1);
      }
    `;

    fs.writeFile(tmpFile, wrappedCode, 'utf8', (writeErr) => {
      if (writeErr) {
        return resolve({ success: false, error: writeErr.message });
      }

      exec(`node "${tmpFile}"`, { timeout: 3500, maxBuffer: 1024 * 1024 }, (err, stdout, stderr) => {
        fs.unlink(tmpFile, () => {});
        if (err && err.killed) {
          return resolve({ success: true, status: 1, runtimeError: 'Time Limit Exceeded (3.5s timeout)', output: '' });
        }
        resolve({
          success: true,
          status: err ? 1 : 0,
          output: (stdout || '').trim(),
          runtimeError: (stderr || '').trim(),
          compilerError: ''
        });
      });
    });
  });
}

const codelabController = {
  async executeCode(req, res) {
    try {
      const { language, code, testCases, problemId } = req.body;

      if (!code || !code.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Please write your solution code before running.'
        });
      }

      const langKey = (language || 'python3').toLowerCase().trim();
      const compiler = COMPILER_MAP[langKey] || COMPILER_MAP['python3'];

      let baseCode = code;

      // Handle Python 3: Auto-append harness if code uses class Solution or def without main/sys.stdin
      if (langKey === 'python' || langKey === 'python3') {
        const hasMain = baseCode.includes("__name__ == '__main__'") || baseCode.includes('__name__ == "__main__"');
        const hasStdin = baseCode.includes('sys.stdin') || baseCode.includes('input(');
        const hasCallable = baseCode.includes('class Solution') || /def\s+[a-zA-Z_]/.test(baseCode);

        if (hasCallable && !hasMain && !hasStdin) {
          baseCode = baseCode + '\n' + generatePythonHarness();
        }
      }

      // Java Sanity: Wandbox compiles Java into prog.java, so 'public class' causes compilation error
      if (langKey === 'java') {
        baseCode = baseCode.replace(/public\s+class\s+/g, 'class ');
      }

      const tcList = Array.isArray(testCases) && testCases.length > 0 ? testCases : [{ input: '', expected: '' }];
      const results = [];
      let allPassed = true;
      let firstCompilerError = null;

      for (let i = 0; i < tcList.length; i++) {
        if (i > 0 && compiler !== 'nodejs-20.17.0') {
          await new Promise(r => setTimeout(r, 120));
        }

        const tc = tcList[i];
        const stdin = tc.input !== undefined && tc.input !== null ? String(tc.input) : '';
        const expected = tc.expected !== undefined && tc.expected !== null ? String(tc.expected) : '';

        let processedCode = baseCode;

        // For JavaScript: Inject per-testcase harness if function/Solution without console/fs
        if (langKey === 'javascript' || langKey === 'js' || langKey === 'node') {
          const hasConsole = processedCode.includes('console.log');
          const hasFs = processedCode.includes('fs.readFileSync');
          const hasCallable = processedCode.includes('class Solution') || /function\s+[a-zA-Z_]/.test(processedCode);

          if (hasCallable && !hasConsole && !hasFs) {
            processedCode = processedCode + '\n' + generateJsHarness(stdin);
          }
        }

        let execResult = null;

        // Run JS locally for instant execution
        if ((langKey === 'javascript' || langKey === 'js' || langKey === 'node') && !processedCode.includes('require(')) {
          execResult = await runJsLocally(processedCode, stdin);
        }

        if (!execResult || !execResult.success) {
          execResult = await runOnWandbox(compiler, processedCode, stdin);
        }

        if (!execResult.success) {
          return res.status(500).json({
            success: false,
            error: execResult.error || 'Execution engine encountered an error. Please try again.'
          });
        }

        const compErr = cleanErrorTrace(execResult.compilerError);
        let runErr = cleanErrorTrace(execResult.runtimeError);

        // Check if Python syntax error was reported in runtimeError / program_error
        const isPythonSyntaxError = (langKey === 'python' || langKey === 'python3') && 
          runErr && (runErr.includes('SyntaxError') || runErr.includes('IndentationError') || runErr.includes('TabError'));

        if (compErr || isPythonSyntaxError) {
          const finalErr = compErr || runErr;
          firstCompilerError = finalErr;
          allPassed = false;
          results.push({
            caseIndex: i + 1,
            input: stdin,
            expected,
            actual: '',
            passed: false,
            compilerError: finalErr,
            status: 'COMPILATION_ERROR'
          });
          break; // Stop immediately on compilation / syntax error
        }

        if (runErr || (execResult.status !== 0 && execResult.status !== '0')) {
          allPassed = false;
          results.push({
            caseIndex: i + 1,
            input: stdin,
            expected,
            actual: execResult.output,
            passed: false,
            runtimeError: runErr || 'Runtime execution error',
            status: 'RUNTIME_ERROR'
          });
          continue;
        }

        const passed = areOutputsEqual(execResult.output, expected);
        if (!passed) allPassed = false;

        results.push({
          caseIndex: i + 1,
          input: stdin,
          expected,
          actual: execResult.output,
          passed,
          status: passed ? 'PASSED' : 'WRONG_ANSWER'
        });
      }

      let overallStatus = 'ACCEPTED';
      if (firstCompilerError) {
        overallStatus = 'COMPILATION_ERROR';
      } else if (results.some(r => r.status === 'RUNTIME_ERROR')) {
        overallStatus = 'RUNTIME_ERROR';
      } else if (!allPassed) {
        overallStatus = 'WRONG_ANSWER';
      }

      const passedCount = results.filter(r => r.passed).length;

      return res.json({
        success: true,
        language: langKey,
        compiler,
        status: overallStatus,
        allPassed,
        passedCount,
        totalCount: tcList.length,
        results,
        compilerError: firstCompilerError || null
      });
    } catch (err) {
      console.error('Code execution error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Server error while executing code'
      });
    }
  }
};

module.exports = codelabController;
