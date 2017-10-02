import json
import sys
import time
from threading import Thread

from modules.data import variables


class ControlSystemsThread(Thread):
    def run(self):
        variables.log2(self.__class__.__name__, "running")
        t0 = time.time()
        t0_spab = t0
        t0_ramp = t0
        t0_step = t0
        t0_control = t0

        controller_type=1
        # if appVariables.appConfig['controller_class'] == 'pi':
        #     controller_type = 1
        #
        # elif appVariables.appConfig['controller_class'] == 'pid':
        #     controller_type=2

        Kp=0
        Ki=0
        Kd=0
        Tf=0
        ctrl_id_prev=-1
        yk=0
        ek=0

        while True:
            time.sleep(0.01)
            t1=time.time()
            if 'value2' in variables.sensorData[variables.appConfig['y_index']]:
                variables.appFlags['yk'] = variables.sensorData[variables.appConfig['y_index']]['value2']
                variables.appFlags['ek'] = variables.appFlags['ref'] - variables.appFlags['yk']
                yk = variables.appFlags['yk']
                ek = variables.appFlags['ek']

            uk = variables.appFlags["pump"]

            if (t1 - t0_control) >= variables.appConfig['ts_control']:
                t0_control = t1
                # multi model control evaluation
                best_model_id = 0
                min_err = 100000
                Ts = variables.appConfig['ts_control']
                # calculate model outputs
                sum_error = 0
                sum_error_norm = 0
                uk_multi = 0
                for i in range(len(variables.appConfig['models'])):
                    model = variables.appConfig['models'][i]
                    yk1_m = variables.appFlags["models"][i]['yk']
                    # the characteristic has insensitive zone
                    # uk_model = uk - model['u_min']

                    uk_model = uk
                    if uk_model < 0:
                        uk_model = 0
                    yk_m = yk1_m * model['den'][1] + uk_model * model['num'][0]
                    variables.appFlags["models"][i]['yk'] = yk_m
                    ek_m = yk - yk_m
                    variables.appFlags["models"][i]['ek'] = ek_m
                    if abs(ek_m) < min_err:
                        min_err = abs(ek_m)
                        best_model_id = i

                if min_err != 0:
                    for i in range(len(variables.appConfig['models'])):
                        model_ek = variables.appFlags["models"][i]['ek']
                        if model_ek == 0:
                            model_ek = 0.01
                        variables.appFlags["models"][i]['ek_norm'] = 1 / (abs(model_ek) / min_err)
                        sum_error_norm += abs(variables.appFlags["models"][i]['ek_norm'])
                # calculate controller outputs
                for i in range(len(variables.appConfig['controllers'])):
                    controller_data = variables.appConfig['controllers'][i]
                    Kp = variables.appConfig['controllers'][i]['kp']
                    Ki = variables.appConfig['controllers'][i]['ki']

                    integral = variables.appFlags['controllers'][i]['integral']
                    integral += ek * Ts * Ki
                    if (integral > 255):
                        integral = 255
                    if (integral < 0):
                        integral = 0

                    variables.appFlags['controllers'][i]['uk'] = ek * Kp + integral
                    variables.appFlags['controllers'][i]['integral'] = integral

                if sum_error_norm != 0:
                    for i in range(len(variables.appConfig['controllers'])):
                        variables.appFlags['controllers'][i]['a'] = variables.appFlags["models"][i]['ek_norm'] / sum_error_norm
                        # blend controller commands for smooth switching between controllers
                        uk_multi += variables.appFlags['controllers'][i]['a'] * variables.appFlags['controllers'][i][
                            'uk']

                # auto modes
                # check modes
                if variables.appFlags["mode"] == 1 or variables.appFlags["mode"] == 5:
                    # auto mode
                    variables.appFlags['control_time'] = t1
                    if variables.appFlags["mode"] == 5:
                        if (t1 - t0_step) >= variables.appConfig['ts_step']:
                            t0_step = t1
                            if (variables.appFlags["spab_index"] < len(
                                    variables.appConfig['ref_step_sequence'])):
                                variables.appFlags["ref"] = variables.appConfig['ref_step_sequence'][
                                    variables.appFlags["spab_index"]]
                                variables.appFlags["spab_index"] += 1
                    ctrl_id = variables.appFlags['controller_id']

                    if variables.appFlags['multi']:
                        # multi model
                        Ts = variables.appConfig['ts_control']

                        # show best model with corresponding controller output
                        variables.appFlags['controller_id'] = best_model_id
                        uk = uk_multi
                        # uk = appVariables.appFlags['controllers'][appVariables.appFlags['controller_id']]['uk']

                    else:
                        if controller_type == 1:
                            if ctrl_id != ctrl_id_prev:
                                Kp = variables.appConfig['controllers'][ctrl_id]['kp']
                                Ki = variables.appConfig['controllers'][ctrl_id]['ki']
                                variables.appFlags['Kp'] = Kp
                                variables.appFlags['Ki'] = Ki
                                variables.appFlags['Kd'] = 0
                                variables.appFlags['Tf'] = 0


                            variables.appFlags['integral'] += ek * Ts * Ki
                            if (variables.appFlags['integral'] > 255):
                                variables.appFlags['integral'] = 255
                            if (variables.appFlags['integral'] < 0):
                                variables.appFlags['integral'] = 0

                            uk = ek * Kp + variables.appFlags['integral']
                        elif controller_type == 2:
                            if ctrl_id != ctrl_id_prev:
                                Kp = variables.appConfig['controllers'][ctrl_id]['kp']
                                Ki = variables.appConfig['controllers'][ctrl_id]['ki']
                                Kd = variables.appConfig['controllers'][ctrl_id]['kd']
                                Tf = variables.appConfig['controllers'][ctrl_id]['tf']

                                Ts = variables.appConfig['ts_control']

                                variables.appFlags['Kp'] = Kp
                                variables.appFlags['Ki'] = Ki
                                variables.appFlags['Kd'] = Kd
                                variables.appFlags['Tf'] = Tf

                                # K1=Kp+Ki+Kd
                                # K2=-Kp-2*Kd
                                # K3=Kd
                                K1 = Kp + (Ts * Ki) + Kd / Ts
                                K2 = -Kp - 2 * Kd / Ts
                                K3 = Kd / Ts
                                ek1 = 0
                                ek2 = 0
                                uk1 = 0

                            variables.appFlags['integral'] += ek * Ts * Ki
                            if (variables.appFlags['integral'] > 255):
                                variables.appFlags['integral'] = 255
                            if (variables.appFlags['integral'] < 0):
                                variables.appFlags['integral'] = 0
                            derivative = (ek - ek1) / Ts
                            uk = ek * Ki + variables.appFlags['integral'] + derivative * Kd
                            ek1 = ek

                    if (uk > 255):
                        uk = 255
                    if (uk < variables.appConfig['u_min']):
                        uk = variables.appConfig['u_min']
                    variables.appFlags["pump"] = int(uk)
                    variables.appFlagsAux['set_pump'] = True
                    ctrl_id_prev = ctrl_id

            if variables.appFlags["mode"]==2:
                # ident mode / static
                if (t1 - t0_ramp) >= variables.appConfig['ts_ramp']:
                    t0_ramp = t1
                    if variables.appFlagsAux["dir_pump"] == 1:
                        if uk <= 255 - variables.appConfig['du_ramp']:
                            uk += variables.appConfig['du_ramp']
                        else:
                            # appVariables.appFlagsAux["dir_pump"] = 0
                            pass
                    else:
                        if uk >= variables.appConfig['du_ramp']:
                            uk -= variables.appConfig['du_ramp']
                        else:
                            variables.appFlagsAux["dir_pump"] = 1
                    variables.appFlags["pump"] = uk
                    variables.appFlagsAux['set_pump'] = True
            elif variables.appFlags["mode"] == 3:
                # ident mode / step sequence
                if (t1 - t0_step) >= variables.appConfig['ts_step']:
                    t0_step = t1
                    if (variables.appFlags["spab_index"] < len(variables.appConfig['step_sequence'])):
                        uk = variables.appConfig['step_sequence'][variables.appFlags["spab_index"]]
                        variables.appFlags["spab_index"] += 1
                    variables.appFlags["pump"] = uk
                    variables.appFlagsAux['set_pump'] = True
            elif variables.appFlags["mode"] == 4:
                # ident mode / spab
                if (t1 - t0_spab) >= variables.appConfig['ts_spab']:
                    t0_spab = t1

                    delta = variables.spab_data[variables.appFlags["spab_index"]] * variables.appConfig['du_spab']
             
                    variables.appFlags["spab_index"]+=1
                    if variables.appFlags["spab_index"] == len(variables.spab_data):
                        variables.appFlags["spab_index"] = 0
                    uk = variables.appConfig['um_spab'] + delta

                    variables.appFlags["pump"] = uk
                    variables.appFlagsAux['set_pump'] = True

        variables.log2(self.__class__.__name__, "stopped")