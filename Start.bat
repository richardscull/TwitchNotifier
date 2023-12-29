@echo off
if not defined in_subprocess (cmd /k set in_subprocess=y ^& %0 %*) & exit )
pushd %~dp0
call npm install --no-audit
npm run buildRun
pause
popd