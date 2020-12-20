/*Package reference: Steven G. Johnson, The NLopt nonlinear-optimization package, http://github.com/stevengj/nlopt*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <nlopt.h>
#include "jsmn.h"

double distance(double x1, double y1, double z1, double x2, double y2, double z2){
	return pow((x1-x2),2) + pow((y1-y2),2) + pow((z1-z2),2);
}

double dis2(double x1, double x2, double x3, double y1, double y2, double y3){
	double a1 = x2*10*cos(x1*2*M_PI)*x3;
	double a2 = x2*10*sin(x1*2*M_PI)*x3;
	double a3 = x3*10;

	double b1 = y2*10*cos(y1*2*M_PI)*y3;
	double b2 = y2*10*sin(y1*2*M_PI)*y3;
	double b3 = y3*10;

	return pow((a1-b1),2) + pow((a2-b2),2) + pow((a3-b3),2);
}

struct Colormap{
	double h;
	double s;
	double l;
};

struct Point{
	double x;
	double y;
};

struct Weights{
	int i1;
	int i2;
	double weight;
};

int count = 0;
int ws = 0;
struct Weights *weights;

double myfunc(unsigned n, const double *x, double *grad, void *data)
{
    double func = 0;
    int i;
    int k;

    if(grad){
    	for(i = 0; i < n; i++){
    		grad[i] = 0;
    	}
    }

    /*int j;
    for(j=0; j < n/3; j++){
    	for(k=j+1; k < n/3; k++){
    		double u = distance(x[j*3],x[j*3+1],x[j*3+2],x[k*3],x[k*3+1],x[k*3+2]);
    		func = func + 1/u;
    		if(grad){
    			grad[j*3] += -2*(x[j*3]-x[k*3])/pow(u,2);
    			grad[j*3+1] += -2*(x[j*3+1]-x[k*3+1])/pow(u,2);
    			grad[j*3+2] += -2*(x[j*3+2]-x[k*3+2])/pow(u,2);
    			grad[k*3] += 2*(x[j*3]-x[k*3])/pow(u,2);
    			grad[k*3+1] += 2*(x[j*3+1]-x[k*3+1])/pow(u,2);
    			grad[k*3+2] += 2*(x[j*3+2]-x[k*3+2])/pow(u,2);
    		}
    	}
    }*/

    //struct Weights *weights = (struct Weight *)data;
    for(i = 0; i < ws; i++){
    	int i1 = weights[i].i1 * 3;
    	int i2 = weights[i].i2 * 3;
    	double u = distance(x[i1],x[i1+1],x[i1+2],x[i2],x[i2+1],x[i2+2]);
   		//printf("x[%d]=%.4f,%.4f,%.4f, x[%d]=%.4f,%.4f,%.4f\n",weights[i].i1, x[i1], x[i1+1], x[i1+2], weights[i].i2, x[i2], x[i2+1], x[i2+2]);
    	//printf("u=%g\n", u);
    	func = func + weights[i].weight/u;
    	if(grad){
    		grad[i1] += -2*weights[i].weight*(x[i1]-x[i2])/u;
    		grad[i1+1] += -2*weights[i].weight*(x[i1+1]-x[i2+1])/pow(u,2);
    		grad[i1+2] += -2*weights[i].weight*(x[i1+2]-x[i2+2])/pow(u,2);
    		grad[i2] += 2*weights[i].weight*(x[i1]-x[i2])/pow(u,2);
    		grad[i2+1] += 2*weights[i].weight*(x[i1+1]-x[i2+1])/pow(u,2);
    		grad[i2+2] += 2*weights[i].weight*(x[i1+2]-x[i2+2])/pow(u,2);
    	}
    }

    /*if(grad){
    	for(i = 0; i < n; i++){
    		printf("grad[%d]: %.2f\n", i, grad[i]);
    	}
    }*/


    //printf("iter: %d\n", ++count);
    return func;
}

typedef struct {
    double a, b;
} my_constraint_data;

double myconstraint(unsigned n, const double *x, double *grad, void *data)
{
    my_constraint_data *d = (my_constraint_data *) data;
    int num = d->a;
    int htor = d->b;
    double func = pow(x[num*3],2) + pow(x[num*3+1],2) - pow(x[num*3+2]/htor,2);
    //printf("func: %.2f\n", func);
    if(grad){
		grad[num*3] = 2*x[num*3];
    	grad[num*3+1] = 2*x[num*3+1];
    	grad[num*3+2] = -2*x[num*3+2]/pow(htor,2);
    	//printf("constraint num: %d\n", num);
    	//printf("inequality: grad[%d]=%.4f, grad[%d]=%.4f, grad[%d]=%.4f\n", num*3, grad[num*3], num*3+1, grad[num*3+1], num*3+2, grad[num*3+2]);
    }
    //double func = x[0];
    return func;
 }

static int jsoneq(const char *json, jsmntok_t *tok, const char *s) {
  if (tok->type == JSMN_STRING && (int)strlen(s) == tok->end - tok->start &&
      strncmp(json + tok->start, s, tok->end - tok->start) == 0) {
    return 0;
  }
  return -1;
}

int getInt(char* str, int start, int len){
	char string[len+1];
	strncpy(string, str+start, len);
	string[len] = 0x00;
	int num = atoi(string);
	return num;
}

double getDouble(char* str, int start, int len){
	char string[len+1];
	strncpy(string, str+start, len);
	string[len] = 0x00;
	double num = atof(string);
	return num;
}

void xRandomInitial(double* x, int n){
	int i;
	for(i=0; i < n; i++){
 		x[3*i] = (double)(rand()%20000) / 10000 - 1;
 		x[3*i+1] = (double)(rand()%20000) / 10000 - 1;
 		x[3*i+2] = (double)(rand()%10000) / 10000;

 		while(pow(x[3*i],2) + pow(x[3*i+1],2) > pow(x[3*i+2],2)){
 			x[3*i] = (double)(rand()%20000) / 10000 - 1;
 			x[3*i+1] = (double)(rand()%20000) / 10000 - 1;
 			x[3*i+2] = (double)(rand()%10000) / 10000;
 		}
 	}
}

void arraycopy(double* x, double* x_best, int n){
	int i;
	for(i=0; i < n; i++)
		x_best[i] = x[i];
}

int main(int argc, char *argv[]){
	FILE *fp;

	if(argv[1]){
		fp = fopen(argv[1], "r");
	}
	else{
		printf("Usage: <program name> <file name>\n");
		return 0;
	}

	fseek(fp, 0, SEEK_END);
	long size = ftell(fp);
	fseek(fp, 0, SEEK_SET);
	char *str = malloc(size+1);
	fread(str, 1, size, fp);
	
	str[size] = 0x00;
	fclose(fp);
	
	jsmn_parser p;
	jsmntok_t t[500000];
	jsmn_init(&p);
  	int r = jsmn_parse(&p, str, strlen(str), t, sizeof(t) / sizeof(t[0]));

  	int i;
  	int n = 0;
  	//struct Weights *weights;
  	struct Point *points;
  	struct Colormap *maps;
  	long bk1, bk2;

  	if (r < 0) {
	    printf("Failed to parse JSON: %d\n", r);
	    return 1;
	}

	  /* Assume the top-level element is an object */
	  if (r < 1 || t[0].type != JSMN_OBJECT) {
	    printf("Object expected\n");
	    return 1;
	}

	for (i = 1; i < r; i++) {
	    if (jsoneq(str, &t[i], "points") == 0) {
	      /* We may use strndup() to fetch string value */
	      int j;
	      n = t[i+1].size;
	      points = malloc(n*sizeof(struct Point));
	      maps = malloc(n*sizeof(struct Colormap));
	      
	      //printf("- points:\n");
	      for (j = 0; j < t[i + 1].size; j++) {
	        jsmntok_t *l = &t[i + 3*j + 3];
	        points[j].x = getDouble(str, l->start, l->end - l->start);
	        l = &t[i + 3*j + 4];
	        points[j].y = getDouble(str, l->start, l->end - l->start);
	      }
	             
	      i+= t[i + 1].size*3 + 1;
	    } else if (jsoneq(str, &t[i], "pairs") == 0) {
	      /* We may additionally check if the value is either "true" or "false" */
	      i+= t[i + 1].size*3 + 1;
	    } else if (jsoneq(str, &t[i], "colormap") == 0) {
	      /* We may want to do strtol() here to get numeric value */
	      int j;
	      bk1 = t[i+1].start;
	      if (t[i + 1].type != JSMN_ARRAY) {
	        continue; /* We expect groups to be an array of strings */
	      }
	      for (j = 0; j < t[i + 1].size; j++) {
	        jsmntok_t *l = &t[i + 4*j + 3];
	        maps[j].h = getDouble(str, l->start, l->end - l->start);
	        l = &t[i + 4*j + 4];
	        maps[j].s = getDouble(str, l->start, l->end - l->start);
	        l = &t[i + 4*j + 5];
	        maps[j].l = getDouble(str, l->start, l->end - l->start);
	      }
	      
	      i+= t[i + 1].size*4 + 1;
	    } else if (jsoneq(str, &t[i], "weight") == 0) {
	      int j;
	      bk2 = t[i].start;
	      weights = malloc(t[i + 1].size*sizeof(struct Weights));
	      if (t[i + 1].type != JSMN_ARRAY) {
	        continue; /* We expect groups to be an array of strings */
	      }
	      for (j = 0; j < t[i + 1].size; j++) {
	        jsmntok_t *l = &t[i + 4*j + 3];
	        weights[j].i1 = getInt(str, l->start, l->end - l->start);
	        l = &t[i + 4*j + 4];
	        weights[j].i2 = getInt(str, l->start, l->end - l->start);
	        l = &t[i + 4*j + 5];
	        weights[j].weight = getDouble(str, l->start, l->end - l->start);
	        ws++;
	      }
	      i += t[i + 1].size*4 + 1;
	    } else {
	      printf("Unexpected key: %.*s\n", t[i].end - t[i].start,
	             str + t[i].start);
	    }
	  }

	
	int N = n*3;
	double ub[N];
 	double lb[N];
 	double x[N];
 	double x_best[N];
	
	int start = time(NULL);
	srand((int)time(NULL));


 	int htor=1; // ratio - height : radius

 	/* Initial from original data

 	for(i=0; i < n; i++){
 		double angle = M_PI * 2 * (maps[i].h / 360);
 		x[3*i] = maps[i].s * cos(angle) * maps[i].l;
 		lb[3*i] = -1;
 		ub[3*i] = 1;
 		x[3*i+1] = maps[i].s * sin(angle) * maps[i].l;
 		lb[3*i+1] = -1;
 		ub[3*i+1] = 1;
 		x[3*i+2] = maps[i].l * htor;
 		lb[3*i+2] = 0;
 		ub[3*i+2] = htor;
 	}*/

 	for(i=0; i < n; i++){
 		x[3*i] = (double)(rand()%20000) / 10000 - 1;
 		lb[3*i] = -1;
 		ub[3*i] = 1;
 		x[3*i+1] = (double)(rand()%20000) / 10000 - 1;
 		lb[3*i+1] = -1;
 		ub[3*i+1] = 1;
 		x[3*i+2] = (double)(rand()%10000) / 10000;
 		lb[3*i+2] = 0;
 		ub[3*i+2] = htor;

 		while(pow(x[3*i],2) + pow(x[3*i+1],2) > pow(x[3*i+2],2)){
 			x[3*i] = (double)(rand()%20000) / 10000 - 1;
 			x[3*i+1] = (double)(rand()%20000) / 10000 - 1;
 			x[3*i+2] = (double)(rand()%10000) / 10000;
 		}
 	}

	nlopt_opt opt;

	opt = nlopt_create(NLOPT_LD_CCSAQ, N); /* algorithm and dimensionality */
	nlopt_set_lower_bounds(opt, lb);
	nlopt_set_upper_bounds(opt, ub);
	nlopt_set_min_objective(opt, myfunc, NULL);

	my_constraint_data data[n];

	for (i=0; i < n; i++){
		data[i].a = i;
		data[i].b = htor;
		nlopt_add_inequality_constraint(opt, myconstraint, &data[i], 1e-10);
	}

	nlopt_set_xtol_rel(opt, 1e-9);

	double minf = -1;
	double f;
	for (i = 0; i < 3; i++){
		xRandomInitial(x, n);
		int code = nlopt_optimize(opt, x, &f);
		if(code < 0){
			printf("nlopt failed on code %d!\n", code);
			continue;
		}

		if(minf < 0 || f < minf){
			arraycopy(x, x_best, N);
			minf = f;
		}
	}


	printf("found minimum at f = %0.10g\n", minf);
    for(i=0; i < n; i++){
    	//printf("x[%d] = %.4f, %.4f, %.4f, len = %f\n", i, x[3*i], x[3*i+1], x[3*i+2], sqrt(pow(x[3*i],2)+pow(x[3*i+1],2)));

    	double angle = atan2(x_best[3*i+1], x_best[3*i]);
	    	
    	maps[i].h = angle * 180 / M_PI + 180;
    	if((int)(x_best[3*i+2] * 10000)/10000 == 0){
    		maps[i].s = 1.00;
    	}
    	else{
    		maps[i].s = sqrt(pow(x_best[3*i],2)+pow(x_best[3*i+1],2)) / x_best[3*i+2] * htor;
    	}
    	maps[i].l = x[3*i+2] / htor;
    	//printf("hsl = %.2f, %.2f, %.2f\n", maps[i].h, maps[i].s, maps[i].l);
    }

	int end = time(NULL);
	printf("total time: %ds\n", end-start);
	printf("iterations: %d\n", nlopt_get_numevals(opt));

	nlopt_destroy(opt);

	char* outName;
	outName = malloc(sizeof(argv[1])+4);
	strcpy(outName, "out_");
	strcat(outName, argv[1]);

	FILE *fpt;
	fpt = fopen(outName, "w+");

	fprintf(fpt,"%.*s", bk1, str);
	fprintf(fpt,"[");
	for(i = 0; i < n; i++){
		fprintf(fpt,"[%.2f,%.4f,%.4f]",maps[i].h, maps[i].s, maps[i].l);
		if(i != n-1){
			fprintf(fpt,",");
		}
		else{
			fprintf(fpt,"],");
		}
	}
	fprintf(fpt,"%.*s", size - bk2 + 1, str + bk2 - 1);

	fclose(fpt);
 }