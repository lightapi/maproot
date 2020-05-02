#!/bin/bash
scp covid-query/target/covid-query-0.1.0.jar prod1:/home/steve/networknt/light-config-prod/prod1/hybrid-query/service
scp covid-query/target/covid-query-0.1.0.jar prod2:/home/steve/networknt/light-config-prod/prod2/hybrid-query/service
scp covid-query/target/covid-query-0.1.0.jar prod3:/home/steve/networknt/light-config-prod/prod3/hybrid-query/service
scp covid-command/target/covid-command-0.1.0.jar prod3:/home/steve/networknt/light-config-prod/prod3/hybrid-command/service
